<?php

namespace SilverStripe\VersionedAdmin\Forms;

use BadMethodCallException;
use InvalidArgumentException;
use LogicException;
use SilverStripe\Forms\CompositeField;
use SilverStripe\Forms\FormField;
use SilverStripe\Forms\FormTransformation;
use SilverStripe\Forms\HTMLReadonlyField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\ORM\DataObject;
use SilverStripe\View\ArrayData;
use SilverStripe\View\Parsers\Diff;

class DiffTransformation extends FormTransformation
{
    /**
     * Field used to contain the 'from' value of the diff.
     * @var array
     */
    protected $data = [];

    /**
     * @param DataObject|ArrayData|array $comparisonData
     */
    public function __construct($comparisonData = null)
    {
        if (!empty($comparisonData)) {
            $this->setComparisonData($comparisonData);
        }
    }

    /**
     * Overrides the comparison data with a new set.
     *
     * @param DataObject|ArrayData|array $comparisonData
     * @param bool $merge true to merge field values with existing data
     * @throws InvalidArgumentException
     * @return $this
     */
    public function setComparisonData($comparisonData, $merge = false)
    {
        if (!is_array($comparisonData)
            && !($comparisonData instanceof DataObject)
            && !($comparisonData instanceof ArrayData)
        ) {
            throw new InvalidArgumentException(
                'comparisonData is not an array, nor an instance of DataObject or ArrayData'
            );
        }

        $comparisonData = is_array($comparisonData) ? $comparisonData : $comparisonData->toMap();

        $this->data = $merge ? array_merge($this->data, $comparisonData) : $comparisonData;

        return $this;
    }

    /**
     * @return array
     */
    public function getComparisonData()
    {
        return $this->data;
    }

    public function transform(FormField $field)
    {
        if ($field->isComposite()) {
            /** @var CompositeField $field */
            // There isn't an interface for child fields so this is unfortunately just a best guess.
            $newKids = $field->getChildren()->transform($this);
            $newField = clone $field;
            $newField->setChildren($newKids);
            return $newField;
        }

        if (!$field->hasData()) {
            // No data; no value.
            return clone $field;
        }

        $data = $this->getComparisonData();
        $name = $field->getName();

        // Do not compare generated security data
        if (!isset($data[$name])
            && ($form = $field->getForm())
            && ($securityToken = $form->getSecurityToken())
            && ($securityTokenName = $securityToken->getName())
            && $securityTokenName === $name
        ) {
            return LiteralField::create($name, '');
        }

        // Do not "compare apples with oranges"
#        if (!isset($data[$name])) {
#            throw new LogicException("No comparison information set for field \"$name\"");
#        }

        try {
            // First check if a field implements performDiffTransformation()
            parent::transform($field);
        } catch (BadMethodCallException $e) {
            $diffField = HTMLReadonlyField::create(
                $name,
                $field->Title(),
                Diff::compareHTML($field->Value(), isset($this->data[$name]) ? $this->data[$name] : '')
            );

            $diffField->addExtraClass($field->extraClass() . " history-viewer__version-detail-diff");
            $diffField->setDescription($field->getDescription());

            return $diffField;
        }
    }
}
