<?php

namespace SilverStripe\VersionedAdmin;

use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Control\Controller;
use SilverStripe\Core\ClassInfo;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridField_ActionMenu;
use SilverStripe\Forms\GridField\GridFieldConfig_Base;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\Forms\GridField\GridFieldFilterHeader;
use SilverStripe\Forms\GridField\GridFieldViewButton;
use SilverStripe\ORM\ArrayList;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\FieldType\DBDatetime;
use SilverStripe\Versioned\GridFieldRestoreAction;
use SilverStripe\Versioned\Versioned;
use SilverStripe\Versioned\VersionedGridFieldState\VersionedGridFieldState;
use SilverStripe\VersionedAdmin\Interfaces\ArchiveViewProvider;
use SilverStripe\View\ArrayData;

/**
 * Archive admin is a section of the CMS that displays archived records
 * from versioned objects and allows for users to restore them.
 *
 * Shows tabs for any implementors of {@link ArchiveViewProvider} and
 * display any other versioned objects in a dropdown
 */
class ArchiveAdmin extends ModelAdmin
{
    private static $url_segment = 'archive';

    private static $menu_title = 'Archive';

    private static $menu_icon_class = 'font-icon-box';

    public $showSearchForm = false;

    protected function init()
    {
        parent::init();

        // Set the default model class to SiteTree, as long as silverstripe/cms is installed
        // This is done otherwise File will be the default set in ModelAdmin::init() which is basically random
        $class = 'SilverStripe\\CMS\\Model\\SiteTree';
        if (!$this->getRequest()->param('ModelClass') &&
            !$this->request->getVar('others') &&
            class_exists($class ?? '')
        ) {
            $this->modelClass = $class;
        }
    }

    /**
     * Produces an edit form with relevant prioritised tabs for Pages, Blocks and Files
     *
     * @param int|null $id
     * @param FieldList|null $fields
     * @return Form A Form object with one tab per {@link \SilverStripe\Forms\GridField\GridField}
     */
    public function getEditForm($id = null, $fields = null)
    {
        $fields = FieldList::create();
        $modelClass = $this->request->getVar('others') ? 'others' : $this->modelClass;
        $classInst = $modelClass !== 'others' ? Injector::inst()->get($this->modelClass) : null;

        if (ClassInfo::hasMethod($classInst, 'getArchiveField')) {
            $listField = $classInst->getArchiveField();
            $fields->push($listField);
        } else {
            $otherVersionedObjects = $this->getVersionedModels('other');
            $modelSelectField = $this->getOtherModelSelectorField($modelClass);
            $fields->push($modelSelectField);

            // If a valid other model name is passed via a request param
            // then show a gridfield with archived records
            if (array_search($modelClass, $otherVersionedObjects ?? [])) {
                $listField = $this->createArchiveGridField('Others', $modelClass);

                $listColumns = $listField->getConfig()->getComponentByType(GridFieldDataColumns::class);
                $listColumns->setDisplayFields([
                    'Title' => _t(__CLASS__ . '.COLUMN_TITLE', 'Title'),
                    'Versions.first.LastEdited' => _t(__CLASS__ . '.COLUMN_DATEARCHIVED', 'Date Archived'),
                    'Versions.first.Author.Name' => _t(__CLASS__ . '.COLUMN_ARCHIVEDBY', 'Archived By'),
                ]);
                $listColumns->setFieldFormatting([
                    'Versions.first.LastEdited' => function ($val, $item) {
                        return DBDatetime::create_field('Datetime', $val)->Ago();
                    },
                ]);

                $fields->push($listField);
            }
        }

        $form = Form::create(
            $this,
            'EditForm',
            $fields,
            FieldList::create()
        )->setHTMLID('Form_EditForm');
        $form->setTemplate($this->getTemplatesWithSuffix('_EditForm'));
        $form->setAttribute('data-pjax-fragment', 'CurrentForm');
        $form->addExtraClass(
            'ArchiveAdmin discardchanges cms-edit-form cms-panel-padded center flexbox-area-grow '.
            $this->BaseCSSClasses()
        );
        $form->setFormAction(Controller::join_links(
            $this->Link($this->sanitiseClassName($this->modelClass)),
            'EditForm'
        ));

        $this->extend('updateEditForm', $form);

        return $form;
    }

    /**
     * Create a gridfield which displays archived objects
     *
     * @param string $title
     * @param string $class
     * @return GridField
     */
    public static function createArchiveGridField($title, $class)
    {
        $config = GridFieldConfig_Base::create();
        $config->removeComponentsByType(VersionedGridFieldState::class);
        $config->removeComponentsByType(GridFieldFilterHeader::class);
        $config->addComponent(new GridFieldDetailForm);
        $config->addComponent(new GridFieldViewButton);
        $config->addComponent(new GridFieldRestoreAction);
        $config->addComponent(new GridField_ActionMenu);

        $singleton = singleton($class);
        $list = $singleton->get();
        $baseTable = $singleton->baseTable();

        $list = $list
            ->setDataQueryParam('Versioned.mode', 'latest_versions');
        // Join a temporary alias BaseTable_Draft, renaming this on execution to BaseTable
        // See Versioned::augmentSQL() For reference on this alias
        $draftTable = $baseTable . '_Draft';
        $list = $list
            ->leftJoin(
                $draftTable,
                "\"{$baseTable}\".\"ID\" = \"{$draftTable}\".\"ID\""
            );

        if ($singleton->hasStages()) {
            $liveTable = $baseTable . '_Live';
            $list = $list->leftJoin(
                $liveTable,
                "\"{$baseTable}\".\"ID\" = \"{$liveTable}\".\"ID\""
            );
        }

        $list = $list->where("\"{$draftTable}\".\"ID\" IS NULL");
        $list = $list->sort('LastEdited DESC');

        $field = GridField::create(
            $title,
            false,
            $list,
            $config
        );
        $field->setModelClass($class);

        return $field;
    }

    /**
     * Returns versioned objects, can be filtered for 'main' (has a tab)
     * or 'other' and is exposed through the 'Others' tab, returns all
     * by default
     *
     * @param string|null $filter Filter by 'main' or 'other'
     * @param boolean $forDisplay Include titles as values in the returned array
     * @return array
     */
    public function getVersionedModels($filter = null, $forDisplay = false)
    {
        // Get dataobjects with staged versioning
        $versionedClasses = array_filter(
            ClassInfo::subclassesFor(DataObject::class) ?? [],
            function ($class) {
                return DataObject::has_extension($class, Versioned::class);
            }
        );

        $archiveProviders = ClassInfo::implementorsOf(ArchiveViewProvider::class);

        $disabledHandledClasses = [];

        // Get the classes that are declared as handled by the disabled providers
        foreach ($archiveProviders as $provider) {
            if (!Injector::inst()->get($provider)->isArchiveFieldEnabled()) {
                $disabledProviderClass = Injector::inst()->get($provider)->getArchiveFieldClass();
                $disabledHandledClasses[] = $disabledProviderClass;

                $disabledHandledClasses = array_merge(
                    $disabledHandledClasses,
                    array_keys(ClassInfo::subclassesFor($disabledProviderClass) ?? [])
                );
            }
        }

        // Remove any subclasses that would also be handled by those disabled providers
        $versionedClasses = array_diff_key($versionedClasses ?? [], array_flip($disabledHandledClasses ?? []));

        // If there is a valid filter passed
        if ($filter && in_array($filter, ['main', 'other'])) {
            $archiveProviderClasses = [];

            // Get the classes that are decalred as handled by ArchiveViewProviders
            foreach ($archiveProviders as $provider) {
                $archiveProviderClass = Injector::inst()->get($provider)->getArchiveFieldClass();
                $archiveProviderClasses[] = $archiveProviderClass;
            }

            switch ($filter) {
                case 'other':
                    $handledClasses = [];
                    // Get any subclasses that would also be handled by those providers
                    foreach ($archiveProviderClasses as $archiveProviderClass) {
                        $handledClasses = array_merge(
                            $handledClasses,
                            array_keys(ClassInfo::subclassesFor($archiveProviderClass) ?? [])
                        );
                    }
                    $versionedClasses = array_filter(
                        $versionedClasses ?? [],
                        function ($class) use ($handledClasses) {
                            return !in_array(strtolower($class ?? ''), $handledClasses ?? []);
                        }
                    );
                    break;
                default: // 'main'
                    $versionedClasses = array_filter(
                        $versionedClasses ?? [],
                        function ($class) use ($archiveProviderClasses) {
                            return in_array($class, $archiveProviderClasses ?? []);
                        }
                    );
                    break;
            }
        }

        // Formats array as [$className => i18n_plural_name]
        if ($forDisplay) {
            $versionedClasses = array_flip($versionedClasses ?? []);

            foreach (array_keys($versionedClasses ?? []) as $className) {
                $versionedClasses[$className] = ucfirst($className::singleton()->i18n_plural_name() ?? '');
            }
        }

        return $versionedClasses;
    }

    /**
     * Creates a dropdown field that displays other archived models
     *
     * @param string $currentModel The model that is currently selected
     * @return DropdownField
     */
    public function getOtherModelSelectorField($currentModel = '')
    {
        $otherVersionedObjects = $this->getVersionedModels('other', true);

        $modelSelectField = DropdownField::create(
            'OtherDropdown',
            _t(__CLASS__ . '.SELECT_TYPE', 'Select a content type'),
            $otherVersionedObjects,
            $currentModel
        );
        $modelSelectField->setAttribute(
            'data-others-archive-url',
            $this->Link('/')
        );
        $modelSelectField->addExtraClass('other-model-selector');
        $modelSelectField->setEmptyString(_t(__CLASS__ . '.SELECT_EMPTY', 'Select…'));
        $modelSelectField->setHasEmptyDefault(true);

        return $modelSelectField;
    }

    /**
     * Use 'Archive' as the top title rather than the model title
     */
    public function Breadcrumbs($unlinked = false)
    {
        $items = parent::Breadcrumbs($unlinked);

        $items[0]->Title = $this->menu_title();

        return $items;
    }

    /**
     * Archive admin needs some extra logic for whether an archive tab should be shown
     *
     * @return array Map of class name to an array of 'title' (see {@link $managed_models})
     */
    public function getManagedModels()
    {
        $models = $this->getVersionedModels();

        // Normalize models to have their model class in array key and all names as the value are uppercased
        foreach ($models as $k => $v) {
            $archivedModels[$v] = array('title' => ucfirst(singleton($v)->i18n_plural_name() ?? ''));
            unset($archivedModels[$k]);
        }

        return $archivedModels;
    }

    /**
     * Add the special 'Others' tab
     *
     * @return ArrayList<ArrayData> An ArrayList of all managed models to build the tabs for this ModelAdmin
     */
    public function getManagedModelTabs()
    {
        $forms = ArrayList::create();
        $mainModels = $this->getVersionedModels('main', true);

        // Display order should be Pages > Blocks > Files > Other
        // Pages, Blocks, Files are treated specially and have extensions defined in _config/archive-admin.yml
        $order = ['Pages', 'Blocks', 'Files'];
        uasort($mainModels, function ($a, $b) use ($order) {
            return array_search($a, $order ?? []) < array_search($b, $order ?? []) ? -1 : 1;
        });
        $isOthersActive = $this->request->getVar('others') !== null
            || array_key_exists($this->modelClass, $otherModels ?? []);

        foreach ($mainModels as $class => $title) {
            $classInst = Injector::inst()->get($class);
            if (ClassInfo::hasMethod($classInst, 'isArchiveFieldEnabled')
                && $classInst->isArchiveFieldEnabled()
            ) {
                $isCurrent = $class === $this->modelClass && !$isOthersActive;
                $forms->push(ArrayData::create([
                    'Title' => $title,
                    'ClassName' => $class,
                    'Link' => $this->Link($this->sanitiseClassName($class)),
                    'LinkOrCurrent' => $isCurrent ? 'current' : 'link'
                ]));
            }
        }

        $otherModels = $this->getVersionedModels('other', true);
        if ($otherModels) {
            $forms->push(ArrayData::create([
                'Title' => _t(__CLASS__ . '.TAB_OTHERS', 'Other'),
                'ClassName' => 'Others ',
                'Link' => $this->Link('?others=1'),
                'LinkOrCurrent' => $isOthersActive ? 'current' : 'link',
            ]));
        }

        $forms->first()->LinkOrCurrent = 'link';

        return $forms;
    }
}
