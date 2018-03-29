<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms\DataObjectVersionFormFactoryTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Forms\HistoryViewerField;

class ObjectWithFields extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => 'Varchar',
        'Age' => 'Int',
    ];

    private static $table_name = 'Test_ObjectWithFields';

    private static $extensions = [
        Versioned::class,
    ];

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldToTab('Root.CustomHistoryTab', HistoryViewerField::create('History'));

        return $fields;
    }
}
