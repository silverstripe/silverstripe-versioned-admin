<?php

namespace SilverStripe\VersionedAdmin\Forms;

use InvalidArgumentException;
use SilverStripe\Control\RequestHandler;
use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extensible;
use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormFactory;
use SilverStripe\Forms\FormField;
use SilverStripe\Forms\Tab;
use SilverStripe\ORM\DataObject;

class DataObjectVersionFormFactory implements FormFactory
{
    use Configurable;
    use Extensible;
    use Injectable;

    /**
     * View a version of the record, readonly: Default.
     *
     * @var string
     */
    const TYPE_HISTORY = 'history';

    /**
     * Define context types that will automatically be converted to readonly forms
     *
     * @config
     * @var string[]
     */
    private static $readonly_types = [
        DataObjectVersionFormFactory::TYPE_HISTORY,
    ];

    public function getForm(RequestHandler $controller = null, $name = FormFactory::DEFAULT_NAME, $context = [])
    {
        // Validate context
        foreach ($this->getRequiredContext() as $required) {
            if (!isset($context[$required])) {
                throw new InvalidArgumentException("Missing required context $required");
            }
        }

        $fields = $this->getFormFields($controller, $name, $context);
        $actions = $this->getFormActions($controller, $name, $context);
        $form = Form::create($controller, $name, $fields, $actions);

        $this->invokeWithExtensions('updateForm', $form, $controller, $name, $context);

        // Populate form from record
        if (isset($context['Record'])) {
            /** @var DataObject $record */
            $record = $context['Record'];
            $form->loadDataFrom($record);

            // Mark as readonly for some types
            if ($this->isReadonlyFormType($context)) {
                $form->makeReadonly();
            }
        }

        $form->addExtraClass('form--fill-height form--no-dividers');
        return $form;
    }

    /**
     * Get form type from 'type' context
     *
     * @param array $context
     * @return string
     */
    public function getFormType(array $context)
    {
        return empty($context['Type']) ? static::TYPE_HISTORY : $context['Type'];
    }

    /**
     * Get whether the current form type should be treated as readonly
     *
     * @param array $context
     * @return bool
     */
    public function isReadonlyFormType(array $context)
    {
        return in_array($this->getFormType($context), $this->config()->get('readonly_types') ?? []);
    }

    protected function getFormFields(RequestHandler $controller = null, $name, $context = [])
    {
        $record = $context['Record'];
        /** @var FieldList $fields */
        $fields = $record->getCMSFields();

        $this->removeHistoryViewerFields($fields);
        $this->removeSelectedRightTitles($fields);

        $this->invokeWithExtensions('updateFormFields', $fields, $controller, $name, $context);

        return $fields;
    }

    /**
     * Do not return {@link HistoryViewerField} instances in the form - remove them if they are found
     *
     * @param FieldList $fields
     */
    protected function removeHistoryViewerFields(FieldList $fields)
    {
        // Remove HistoryViewerFields
        $fields->recursiveWalk(function (FormField $field) {
            if ($field instanceof HistoryViewerField) {
                $field->getContainerFieldList()->remove($field);
            }
        });

        // Cleanup empty tabs after removing HistoryViewerFields
        $fields->recursiveWalk(function (FormField $field) {
            if ($field instanceof Tab && !$field->Fields()->count()) {
                $field->getContainerFieldList()->remove($field);
            }
        });
    }

    /**
     * Remove right titles from selected form fields by default
     *
     * @param FieldList $fields
     */
    protected function removeSelectedRightTitles(FieldList $fields)
    {
        $noRightTitle = ['MetaDescription', 'ExtraMeta'];

        foreach ($noRightTitle as $fieldName) {
            if ($field = $fields->dataFieldByName($fieldName)) {
                $field->setRightTitle('');
            }
        }
    }

    protected function getFormActions(RequestHandler $controller = null, $formName, $context = [])
    {
        $actions = FieldList::create();
        $this->invokeWithExtensions('updateFormActions', $actions, $controller, $formName, $context);
        return $actions;
    }

    public function getRequiredContext()
    {
        return ['Record'];
    }
}
