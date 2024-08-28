<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class TestVersionedObject extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => 'Varchar',
    ];

    private static $table_name = 'Test_TestVersionedObject';

    private static $extensions = [
        Versioned::class,
    ];

    public static $fail = '';

    public function canView($member = null, $context = [])
    {
        return self::$fail !== 'can-view';
    }

    public function canEdit($member = null, $context = [])
    {
        return self::$fail !== 'can-edit';
    }
}
