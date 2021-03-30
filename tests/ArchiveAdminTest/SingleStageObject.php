<?php

namespace SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class SingleStageObject extends DataObject implements TestOnly
{
    private static $table_name = 'Test_SingleStageObject';

    private static $extensions = [
        Versioned::class . '.versioned',
    ];
}
