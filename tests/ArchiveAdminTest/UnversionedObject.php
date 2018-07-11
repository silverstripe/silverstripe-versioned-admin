<?php

namespace SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;

class UnversionedObject extends DataObject implements TestOnly
{
    private static $table_name = 'Test_UnversionedObject';
}
