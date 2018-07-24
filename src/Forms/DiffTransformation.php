<?php

namespace SilverStripe\VersionedAdmin\Forms;

use BadMethodCallException;
use SilverStripe\Forms\CompositeField;
use SilverStripe\Forms\FormField;
use SilverStripe\Forms\FormTransformation;
use SilverStripe\Forms\LiteralField;

class DiffTransformation extends FormTransformation
{
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

        $name = $field->getName();

        // Do not compare generated security data
        if (($form = $field->getForm())
            && ($securityToken = $form->getSecurityToken())
            && ($securityTokenName = $securityToken->getName())
            && $securityTokenName === $name
        ) {
            return LiteralField::create($name, '');
        }

        try {
            // First check if a field implements performDiffTransformation()
            $diffField = parent::transform($field);
        } catch (BadMethodCallException $e) {
            $diffField = $field->castedCopy(DiffField::class);
            $diffField->addExtraClass("history-viewer__version-detail-diff");
            $diffField->setComparisonField($field);
        }
        return $diffField;
    }
}
