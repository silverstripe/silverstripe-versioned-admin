<?php

namespace SilverStripe\VersionedAdmin\Interfaces;

use SilverStripe\Forms\FormField;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\ORM\DataObject;

/**
 * A provider of a view for the archive admin
 */
interface ArchiveViewProvider
{
    /**
     * Returns the classname of the objects displayed in the field
     *
     * @return array
     */
    public function getArchiveFieldClass();

    /**
     * Method on a {@link DataObject} which returns a custom field (usually {@link GridField})
     * for viewing and/or interacting with this objects archived records
     *
     * @return FormField
     */
    public function getArchiveField();

    /**
     * Returns whether the archive panel should be shown
     *
     * @return boolean
     */
    public function isArchiveFieldEnabled();
}
