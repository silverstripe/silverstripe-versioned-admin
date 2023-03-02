<?php

namespace SilverStripe\VersionedAdmin\Forms;

use SilverStripe\Dev\Deprecation;
use SilverStripe\Forms\FormField;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField_Readonly;
use SilverStripe\Forms\HTMLReadonlyField;
use SilverStripe\Forms\ReadonlyField;
use SilverStripe\View\Parsers\HtmlDiff;

/**
 * This form field is both a field object in it's own right, and a decorator for another field type.
 * It is used to render differences between two data entries into the field type it wraps
 * e.g. a TextField with the value "Old data" can be transformed with {@see DiffTransformation}
 * and then having setValue called again to load in "New data" - this field will then render
 * the value "<ins>New</ins> <del>Old</del> data". Most useful in historic version comparisons
 * {@see SilverStripe\Versioned\Versioned}
 */
class DiffField extends HTMLReadonlyField
{
    /**
     * @var FormField Holds the field used as the 'To' (the newer) data for the diff.
     */
    protected $comparisonField;

    /**
     * @param FormField $field
     * @return $this
     */
    public function setComparisonField(FormField $field)
    {
        $this->comparisonField = $field;
        $this->setFailover($this->comparisonField);
        return $this;
    }

    /**
     * @return FormField
     */
    public function getComparisonField()
    {
        return $this->comparisonField;
    }

    public function Value()
    {
        $oldValue = $this->getOutdatedField()->Value();
        $newValue = $this->getComparisonField()->Value();

        // Objects can't be diffed
        if (is_object($oldValue) || is_object($newValue)) {
            return sprintf('(%s)', _t(__CLASS__ . '.NO_DIFF_AVAILABLE', 'No diff available'));
        }
        // Escape content from everything except HTMLEditorFields
        $escape = true;
        if ($this->getComparisonField() instanceof HTMLEditorField_Readonly) {
            $escape = false;
        }
        // Ensure that the emtpy placeholder value is not escaped
        // The empty placeholder value is usually going to be `<i>('none')</i>`
        $emptyPlaceholder = ReadonlyField::create('na')->Value();
        if ($oldValue === $newValue && $newValue === $emptyPlaceholder) {
            // if both the old and new valus are empty, let the surronding <i> tags render as HTML (escape = false)
            $escape = false;
        } else {
            // if either the new or old values are the empty placeholder, but the corresponding valued
            // diffed against is not, then strip the surronding <i> tags and do not render as HTML (escape = true)
            if ($oldValue === $emptyPlaceholder) {
                $oldValue = strip_tags($emptyPlaceholder);
            } elseif ($newValue === $emptyPlaceholder) {
                $newValue = strip_tags($emptyPlaceholder);
            }
        }

        return HtmlDiff::compareHtml($oldValue ?? '', $newValue ?? '', $escape);
    }

    /**
     * This function is so named not in the manner of chronology,
     * but rather in terms of succession.
     * That is to say the 'outdated' field may in fact be for a newer
     * value in terms of chronology, but a diff shows what it takes to
     * turn one value _into_ another... and in this case the 'from' field
     * value is succeeded by the 'to' value - it becomes 'outdated'.
     *
     * @return FormField
     */
    public function getOutdatedField()
    {
        $newField = clone $this->getComparisonField();
        $newField->setValue($this->value);
        return $newField;
    }

    public function getSchemaDataDefaults()
    {
        return array_merge(
            $this->getComparisonField()->getSchemaDataDefaults(),
            parent::getSchemaDataDefaults()
        );
    }

    public function getSchemaStateDefaults()
    {
        $fromValue = $this->getOutdatedField()->Value();
        $toField = $this->getComparisonField();
        $toValue = $toField->Value();

        $state = array_merge(
            $toField->getSchemaStateDefaults(),
            parent::getSchemaStateDefaults(),
            ['value' => $this->Value()]
        );
        $state['data']['diff'] = [
            'from' => $fromValue,
            'to' => $toValue,
        ];

        return $state;
    }
}
