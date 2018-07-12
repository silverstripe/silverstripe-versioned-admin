<?php

namespace SilverStripe\VersionedAdmin\Tests;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\UnversionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\VersionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderChildObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderVersionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ChildVersionedObject;

class ArchiveAdminTest extends SapphireTest
{
    protected static $extra_dataobjects = [
        ChildVersionedObject::class,
        UnversionedObject::class,
        VersionedObject::class,
        ViewProviderChildObject::class,
        ViewProviderVersionedObject::class,
    ];

    protected function setUp()
    {
        parent::setUp();
    }

    public function testGetVersionedModels()
    {
        $archiveAdmin = ArchiveAdmin::create();
        $allVersionedObjects = $archiveAdmin->getVersionedModels();

        $this->assertContains(ChildVersionedObject::class, $allVersionedObjects);
        $this->assertContains(VersionedObject::class, $allVersionedObjects);
        $this->assertContains(ViewProviderChildObject::class, $allVersionedObjects);
        $this->assertContains(ViewProviderVersionedObject::class, $allVersionedObjects);
        $this->assertNotContains(UnversionedObject::class, $allVersionedObjects);

        $mainVersionedObjects = $archiveAdmin->getVersionedModels('main');
        $this->assertNotContains(ChildVersionedObject::class, $mainVersionedObjects);
        $this->assertNotContains(VersionedObject::class, $mainVersionedObjects);
        $this->assertNotContains(ViewProviderChildObject::class, $mainVersionedObjects);
        $this->assertContains(ViewProviderVersionedObject::class, $mainVersionedObjects);

        $otherVersionedObjects = $archiveAdmin->getVersionedModels('other');
        $this->assertContains(ChildVersionedObject::class, $otherVersionedObjects);
        $this->assertContains(VersionedObject::class, $otherVersionedObjects);
        $this->assertNotContains(ViewProviderChildObject::class, $otherVersionedObjects);
        $this->assertNotContains(ViewProviderVersionedObject::class, $otherVersionedObjects);
    }
}
