<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class ViewableVersionedObject extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => 'Varchar',
    ];

    private static $table_name = 'Test_ViewableVersionedObject';

    private static $extensions = [
        Versioned::class,
    ];

    public function canView($member = null)
    {
        return true;
    }
}
