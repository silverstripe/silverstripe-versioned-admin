<?php

namespace SilverStripe\VersionedAdmin;

use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Control\Controller;
use SilverStripe\Core\ClassInfo;
use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridField_ActionMenu;
use SilverStripe\Forms\GridField\GridFieldConfig_Base;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\Forms\GridField\GridFieldRestoreAction;
use SilverStripe\Forms\GridField\GridFieldViewButton;
use SilverStripe\ORM\ArrayList;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Versioned\Versioned;
use SilverStripe\Versioned\VersionedGridFieldState\VersionedGridFieldState;
use SilverStripe\VersionedAdmin\ArchiveViewProvider;
use SilverStripe\View\ArrayData;
use SilverStripe\View\Requirements;

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

    private static $menu_title = 'Archives';

    private static $menu_icon_class = 'font-icon-box';

    public $showSearchForm = false;

    protected function init()
    {
        parent::init();

        Requirements::javascript('silverstripe/versioned-admin:client/dist/js/bundle.js');
        Requirements::css('silverstripe/versioned-admin:client/dist/styles/bundle.css');
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
        $fields = new FieldList();
        $otherVersionedObjects = $this->getVersionedModels('other');
        $modelClass = $this->request->getVar('others') ? 'others' : $this->modelClass;

        if (ClassInfo::hasMethod(Injectable::singleton($this->modelClass), 'getArchiveField')) {
            $listField = Injectable::singleton($this->modelClass)->getArchiveField();
            $fields->push($listField);
        } else {
            $modelSelectField = $this->getOtherModelSelectorField($modelClass);
            $fields->push($modelSelectField);

            // If a valid other model name is passed via a request param
            // then show a gridfield with archived records
            if (array_search($modelClass, $otherVersionedObjects)) {
                $listField = $this->createArchiveGridField('Others', $modelClass);

                $listColumns = $listField->getConfig()->getComponentByType(GridFieldDataColumns::class);
                $listColumns->setDisplayFields([
                    'Name' => _t(__CLASS__ . '.COLUMN_NAME', 'Name'),
                    'LastEdited.Ago' => _t(__CLASS__ . '.COLUMN_DATEARCHIVED', 'Date Archived'),
                    'AuthorID' => _t(__CLASS__ . '.COLUMN_ARCHIVEDBY', 'Archived By'),
                ]);
                $listColumns->setFieldFormatting([
                    'AuthorID' => function ($val, $item) {
                        return Member::get_by_id($val)->Name;
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
        $form->addExtraClass('ArchiveAdmin discardchanges cms-edit-form cms-panel-padded center flexbox-area-grow ' . $this->BaseCSSClasses());
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
        $config->addComponent(new GridFieldDetailForm);
        $config->addComponent(new GridFieldViewButton);
        $config->addComponent(new GridFieldRestoreAction);
        $config->addComponent(new GridField_ActionMenu);

        $items = Versioned::get_including_deleted($class);
        $items = $items->filterByCallback(function ($item) {
            return $item->isArchived();
        });

        $field = GridField::create(
            $title,
            false,
            $items->sort('LastEdited DESC'),
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
        $archiveProviders = ClassInfo::implementorsOf(ArchiveViewProvider::class);
        $archiveProviderClasses = [];
        $handledClasses = [];

        // Get the classes that are decalred as handled by ArchiveViewProviders
        foreach ($archiveProviders as $provider) {
            $archiveProviderClass = Injectable::singleton($provider)->getArchiveFieldClass();
            $archiveProviderClasses[] = $archiveProviderClass;
        }

        // Get any subclasses that would also be handled by those providers
        foreach ($archiveProviderClasses as $archiveProviderClass) {
            $handledClasses = array_merge($handledClasses, array_keys(ClassInfo::subclassesFor($archiveProviderClass)));
        }

        // Get dataobjects that have versioned as an extension
        $versionedClasses = array_filter(
            ClassInfo::subclassesFor(DataObject::class),
            function ($class) use ($filter, $archiveProviderClasses, $handledClasses) {
                switch ($filter) {
                    case 'main':
                        $include = array_search($class, $archiveProviderClasses) !== false;
                        break;

                    case 'other':
                        $include = array_search(strtolower($class), $handledClasses) === false;
                        break;

                    default:
                        $include = true;
                        break;
                }
                return (
                    DataObject::has_extension($class, Versioned::class) &&
                    $include
                );
            }
        );

        // Formats array as [$className => i18n_plural_name]
        if ($forDisplay) {
            $versionedClasses = array_flip($versionedClasses);

            foreach (array_keys($versionedClasses) as $className) {
                $versionedClasses[$className] = ucfirst($className::singleton()->i18n_plural_name());
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
     * Use 'Archives' as the top title rather than the model title
     *
     * @param bool $unlinked
     * @return ArrayList
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
            $archivedModels[$v] = array('title' => ucfirst(singleton($v)->i18n_plural_name()));
            unset($archivedModels[$k]);
        }

        return $archivedModels;
    }

    /**
     * Add the special 'Others' tab
     *
     * @return ArrayList An ArrayList of all managed models to build the tabs for this ModelAdmin
     */
    public function getManagedModelTabs()
    {
        $forms = new ArrayList();

        $mainModels = $this->getVersionedModels('main', true);
        foreach ($mainModels as $class => $title) {
            $forms->push(new ArrayData(array(
                'Title' => $title,
                'ClassName' => $class,
                'Link' => $this->Link($this->sanitiseClassName($class)),
                'LinkOrCurrent' => ($class === $this->modelClass) ? 'current' : 'link'
            )));
        }

        $otherModels = $this->getVersionedModels('other', true);
        if ($otherModels) {
            $isOtherActive = (
                $this->request->getVar('others') !== null ||
                array_key_exists($this->modelClass, $otherModels)
            );
            $forms->push(new ArrayData([
                'Title' => _t(__CLASS__ . '.TAB_OTHERS', 'Others'),
                'ClassName' => 'Others',
                'Link' => $this->Link('?others=1'),
                'LinkOrCurrent' => ($isOtherActive ? 'current' : 'link')
            ]));
        }

        $forms->first()->LinkOrCurrent = 'link';

        return $forms;
    }
}
