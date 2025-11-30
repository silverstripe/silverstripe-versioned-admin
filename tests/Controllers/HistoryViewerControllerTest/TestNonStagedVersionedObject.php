<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class TestNonStagedVersionedObject extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => 'Varchar',
    ];

    private static $table_name = 'Test_TestNonStagedVersionedObject';

    private static $extensions = [
        Versioned::class . '.versioned',
    ];
}
