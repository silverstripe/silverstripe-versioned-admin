<?php

namespace SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Interfaces\ArchiveViewProvider;

class ViewProviderVersionedObject extends DataObject implements ArchiveViewProvider
{
    private static $table_name = 'Test_ViewProviderVersionedObject';

    private static $extensions = [
        Versioned::class,
    ];

    public function getArchiveFieldClass()
    {
        return ViewProviderVersionedObject::class;
    }
    public function getArchiveField()
    {
        return null;
    }
    public function isArchiveFieldEnabled()
    {
        return true;
    }
}
