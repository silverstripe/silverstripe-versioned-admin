<?php

namespace SilverStripe\VersionedAdmin\Tests;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ChildVersionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\SingleStageObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\UnversionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\VersionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderChildObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderVersionedObject;

class ArchiveAdminTest extends SapphireTest
{

    protected static $extra_dataobjects = [
        ChildVersionedObject::class,
        UnversionedObject::class,
        VersionedObject::class,
        SingleStageObject::class,
        ViewProviderChildObject::class,
        ViewProviderVersionedObject::class,
    ];

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function testGetVersionedModels()
    {
        $allVersionedObjects = ArchiveAdmin::getVersionedModels();

        $this->assertContains(ChildVersionedObject::class, $allVersionedObjects);
        $this->assertContains(VersionedObject::class, $allVersionedObjects);
        $this->assertContains(SingleStageObject::class, $allVersionedObjects);
        $this->assertContains(ViewProviderChildObject::class, $allVersionedObjects);
        $this->assertContains(ViewProviderVersionedObject::class, $allVersionedObjects);
        $this->assertNotContains(UnversionedObject::class, $allVersionedObjects);

        $mainVersionedObjects = ArchiveAdmin::getVersionedModels('main');
        $this->assertNotContains(ChildVersionedObject::class, $mainVersionedObjects);
        $this->assertNotContains(VersionedObject::class, $mainVersionedObjects);
        $this->assertNotContains(SingleStageObject::class, $mainVersionedObjects);
        $this->assertNotContains(ViewProviderChildObject::class, $mainVersionedObjects);
        $this->assertContains(ViewProviderVersionedObject::class, $mainVersionedObjects);

        $otherVersionedObjects = ArchiveAdmin::getVersionedModels('other');
        $this->assertContains(ChildVersionedObject::class, $otherVersionedObjects);
        $this->assertContains(VersionedObject::class, $otherVersionedObjects);
        $this->assertContains(SingleStageObject::class, $otherVersionedObjects);
        $this->assertNotContains(ViewProviderChildObject::class, $otherVersionedObjects);
        $this->assertNotContains(ViewProviderVersionedObject::class, $otherVersionedObjects);
    }

    public function testGridFieldList()
    {
        $archiveAdmin = ArchiveAdmin::create();

        $grid1 = $archiveAdmin->createArchiveGridField('test', VersionedObject::class);

        $v = new VersionedObject();
        $v->write();
        $v->publishSingle();

        $this->assertEquals([], $grid1->getList()->column('ID'));

        $vID = $v->ID;
        $v->doUnpublish();
        $v->delete();

        $this->assertEquals([$vID], $grid1->getList()->column('ID'));

        $grid2 = $archiveAdmin->createArchiveGridField('test', SingleStageObject::class);

        $s = new SingleStageObject();
        $s->write();

        $this->assertEquals([], $grid2->getList()->column('ID'));

        $sID = $s->ID;
        $s->delete();

        $this->assertEquals([$sID], $grid2->getList()->column('ID'));
    }
}
