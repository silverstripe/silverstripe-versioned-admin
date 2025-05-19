<?php

namespace SilverStripe\VersionedAdmin\Tests;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\ORM\DataObject;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ChildVersionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\SingleStageObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\UnversionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\VersionedObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderChildObject;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\ViewProviderVersionedObject;
use SilverStripe\ORM\DB;
use ReflectionMethod;

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
        $archiveAdmin = ArchiveAdmin::create();
        $allVersionedObjects = $archiveAdmin->getVersionedModels();

        $this->assertContains(ChildVersionedObject::class, $allVersionedObjects);
        $this->assertContains(VersionedObject::class, $allVersionedObjects);
        $this->assertContains(SingleStageObject::class, $allVersionedObjects);
        $this->assertContains(ViewProviderChildObject::class, $allVersionedObjects);
        $this->assertContains(ViewProviderVersionedObject::class, $allVersionedObjects);
        $this->assertNotContains(UnversionedObject::class, $allVersionedObjects);

        $mainVersionedObjects = $archiveAdmin->getVersionedModels('main');
        $this->assertNotContains(ChildVersionedObject::class, $mainVersionedObjects);
        $this->assertNotContains(VersionedObject::class, $mainVersionedObjects);
        $this->assertNotContains(SingleStageObject::class, $mainVersionedObjects);
        $this->assertNotContains(ViewProviderChildObject::class, $mainVersionedObjects);
        $this->assertContains(ViewProviderVersionedObject::class, $mainVersionedObjects);

        $otherVersionedObjects = $archiveAdmin->getVersionedModels('other');
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

        // $obj = DataObject::singleton(VersionedObject::class);
        // /** @var DataList $list */
        // $list = $obj->get();
        // $baseTable = $obj->baseTable();
        // foreach (DB::query("select * from {$baseTable}_Versions")->getIterator() as $r) {
        //     p($r);
        // }

        $this->assertEquals([], $grid1->getList()->column('ID'));

        $vID = $v->ID;
        $v->doUnpublish();
        $v->doArchive();

        // foreach (DB::query("select * from {$baseTable}_Versions")->getIterator() as $r) {
        //     p($r);
        // }

        $ids = [];
        p(__FUNCTION__);
        foreach ($grid1->getList() as $item) {
            p($item->ID);
        }

        $this->assertEquals([$vID], $grid1->getList()->column('ID'));

        $grid2 = $archiveAdmin->createArchiveGridField('test', SingleStageObject::class);

        $s = new SingleStageObject();
        $s->write();

        $this->assertEquals([], $grid2->getList()->column('ID'));

        $sID = $s->ID;
        $s->delete();

        $this->assertEquals([$sID], $grid2->getList()->column('ID'));
    }

    public function testGetListForGridField(): void
    {
        $obj1 = new VersionedObject();
        $obj2 = new VersionedObject();
        $obj3 = new VersionedObject();
        $dataClass = $obj1::class;
        $baseTable = DataObject::getSchema()->baseDataTable($dataClass);
        $versionsTable = $baseTable . '_Versions';
        $id1 = $obj1->write();
        $id2 = $obj2->write();
        $id3 = $obj3->write();
        // Publish and unpublish one of the records to ensure Versioned records are
        // not being double counted
        $obj1->publishSingle();
        $obj1->doUnpublish();
        $obj1->doArchive();
        $obj2->doArchive();
        $obj3->doArchive();
        // Intentionally updating these 'out of order' i.e. not '01', '02', '03'
        // to ensure that things are sorted by LastEdited, not just ID
        $this->updateVersionsTableLastEdited($id1, '02', $versionsTable);
        $this->updateVersionsTableLastEdited($id2, '01', $versionsTable);
        $this->updateVersionsTableLastEdited($id3, '03', $versionsTable);

        $admin = new ArchiveAdmin();
        $refl = new ReflectionMethod($admin, 'getListForGridField');
        $refl->setAccessible(true);
        $list = $refl->invoke($admin, $dataClass);
        $this->assertSame([
            $id3 => '2025-01-01 00:00:03',
            $id1 => '2025-01-01 00:00:02',
            $id2 => '2025-01-01 00:00:01'
        ], $list->map('RecordID', 'LastEdited')->toArray());
    }

    private function updateVersionsTableLastEdited(int $recordID, int $seconds, string $versionsTable): void
    {
        DB::query(<<<EOT
            UPDATE "$versionsTable"
            SET "LastEdited"='2025-01-01 00:00:$seconds'
            WHERE "RecordID" = $recordID
            AND "WasDeleted" = 1
        EOT
        );
    }
}
