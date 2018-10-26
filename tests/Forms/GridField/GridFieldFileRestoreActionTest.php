<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms\GridField;

use SilverStripe\Assets\File;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridField_FormAction;
use SilverStripe\Forms\GridField\GridFieldConfig;
use SilverStripe\ORM\ArrayList;
use SilverStripe\VersionedAdmin\Forms\GridField\GridFieldFileRestoreAction;
use SilverStripe\VersionedAdmin\Tests\ArchiveAdminTest\VersionedObject;

class GridFieldFileRestoreActionTest extends SapphireTest
{
    public function testGetRestoreAction()
    {
        $this->logInWithPermission('ADMIN');
        $gridField = GridField::create('Test', 'Test', ArrayList::create(), new GridFieldConfig());

        $action = new GridFieldFileRestoreAction();
        $this->assertNull($action->getRestoreAction($gridField, new VersionedObject(), 'Test'));
        $this->assertNull($action->getRestoreAction($gridField, new File(), 'Test'));

        $file = $this->getMockBuilder(File::class)
            ->setMethods(['exists'])
            ->getMock();
        $file->method('exists')
            ->willReturn(true);

        $this->assertInstanceOf(GridField_FormAction::class, $action->getRestoreAction($gridField, $file, 'Test'));
    }
}
