<?php

namespace SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\VersionedObject;

class ChildVersionedObject extends VersionedObject implements TestOnly
{
    private static $table_name = 'Test_ChildVersionedObject';
}
