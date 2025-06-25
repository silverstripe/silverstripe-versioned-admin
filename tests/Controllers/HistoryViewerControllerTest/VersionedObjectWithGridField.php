<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordViewer;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class VersionedObjectWithGridField extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => 'Varchar',
        'MyInt' => 'Int',
    ];

    private static $table_name = 'Test_VersionedObjectWithGridField';

    private static $extensions = [
        Versioned::class,
    ];

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $fields->addFieldToTab(
            'Root.Main',
            NotTransformableGridField::create(
                'MyGridField',
                null,
                static::get(),
                GridFieldConfig_RecordViewer::create()
            )
        );
        return $fields;
    }
}
