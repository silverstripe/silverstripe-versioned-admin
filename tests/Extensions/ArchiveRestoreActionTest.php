<?php

namespace SilverStripe\VersionedAdmin\Tests\Extensions;

use SilverStripe\VersionedAdmin\Tests\Extensions\Controller\TestController;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Control\Session;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_Base;
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\ORM\ArrayList;
use SilverStripe\View\ArrayData;
use SilverStripe\Versioned\VersionedGridFieldItemRequest;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest\ViewableVersionedObject;

class ArchiveRestoreActionTest extends SapphireTest
{
    protected static $fixture_file = 'ArchiveRestoreActionTest.yml';

    protected static $extra_dataobjects = [
        ViewableVersionedObject::class,
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->logInWithPermission('ADMIN');
    }

    protected function tearDown(): void
    {
        $this->logOut();
        parent::tearDown();
    }

    public function testDoRestore()
    {
        $object = $this->objFromFixture(ViewableVersionedObject::class, 'object_1');
        $gridField = GridField::create('Test', 'Test', ArrayList::create(), GridFieldConfig_Base::create());
        $gridField->setModelClass(ViewableVersionedObject::class);
        $controller = TestController::create(ViewableVersionedObject::class);
        $controller->setRequest(new HTTPRequest('GET', '/'));
        $controller->getRequest()->setSession(new Session([]));
        $form = Form::create($controller, 'TestForm', FieldList::create());

        $itemRequest = VersionedGridFieldItemRequest::create(
            $gridField,
            $form,
            $object,
            $controller,
            'test'
        );
        $object->doArchive();

        $response = $itemRequest->doRestore([], $form);
        $this->assertEquals($response->getStatusCode(), '302', 'Redirect status code should be 302');
    }

    public function testUpdateItemEditForm()
    {
        $object = $this->objFromFixture(ViewableVersionedObject::class, 'object_1');
        $gridField = GridField::create('Test', 'Test', ArrayList::create(), GridFieldConfig_Base::create());
        $controller = TestController::create(ViewableVersionedObject::class);
        $controller->setRequest(new HTTPRequest('GET', '/'));
        $controller->getRequest()->setSession(new Session([]));
        $form = Form::create($controller, 'TestForm', FieldList::create());

        $itemRequest = VersionedGridFieldItemRequest::create(
            $gridField,
            $form,
            $object,
            $controller,
            'test'
        );

        $itemRequest->updateItemEditForm($form);
        $actions = $form->Actions();
        $this->assertInstanceOf(FormAction::class, $actions->fieldByName('action_doRestore'));
    }
}
