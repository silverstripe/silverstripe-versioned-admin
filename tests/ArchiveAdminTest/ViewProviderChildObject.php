<?php

namespace SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderVersionedObject;

class ViewProviderChildObject extends ViewProviderVersionedObject implements TestOnly
{
    private static $table_name = 'Test_ViewProviderChildObject';
}
