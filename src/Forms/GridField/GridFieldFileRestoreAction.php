<?php

namespace SilverStripe\VersionedAdmin\Forms\GridField;

use SilverStripe\Assets\File;
use SilverStripe\Versioned\GridFieldRestoreAction;

/**
 * Extension of GridFieldRestoreAction to only show action if there is a valid file
 */
class GridFieldFileRestoreAction extends GridFieldRestoreAction
{
    /**
     * @inheritdoc
     */
    public function getRestoreAction($gridField, $record, $columnName)
    {
        // Only show the action if the file exists
        if ($record instanceof File && $record->exists()) {
            return parent::getRestoreAction($gridField, $record, $columnName);
        }
        return null;
    }
}
