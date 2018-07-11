<?php

namespace SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class VersionedObject extends DataObject implements TestOnly
{
    private static $table_name = 'Test_VersionedObject';

    private static $extensions = [
        Versioned::class,
    ];
}
