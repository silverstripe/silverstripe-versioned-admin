<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers;

use InvalidArgumentException;
use SilverStripe\Admin\LeftAndMainFormRequestHandler;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\Form;
use SilverStripe\VersionedAdmin\Controllers\HistoryViewerController;
use SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest\UnviewableVersionedObject;
use SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest\ViewableVersionedObject;

class HistoryViewerControllerTest extends SapphireTest
{
    protected static $fixture_file = 'HistoryViewerControllerTest.yml';

    protected static $extra_dataobjects = [
        ViewableVersionedObject::class,
        UnviewableVersionedObject::class,
    ];

    public function testGetClientConfig()
    {
        $controller = new HistoryViewerController();

        $clientConfig = $controller->getClientConfig();

        $this->assertArrayHasKey('versionForm', $clientConfig['form']);
        $this->assertArrayHasKey('schemaUrl', $clientConfig['form']['versionForm']);
    }

    public function testSchema()
    {
        $controllerMock = $this->getMockBuilder(HistoryViewerController::class)
            ->setMethods(['getVersionForm', 'getSchemaResponse'])
            ->getMock();

        $controllerMock->expects($this->once())->method('getVersionForm')->with([
            'RecordClass' => 'Page',
            'RecordID' => 123,
            'RecordVersion' => 234,
        ]);

        $controllerMock->expects($this->once())->method('getSchemaResponse')->willReturn(true);

        $request = $this->getMockBuilder(HTTPRequest::class)
            ->setConstructorArgs(['GET', '/'])
            ->setMethods(['param'])
            ->getMock();

        $request->expects($this->once())->method('param')->with('FormName')->willReturn('versionForm');

        $request->offsetSet('RecordClass', 'Page');
        $request->offsetSet('RecordID', 123);
        $request->offsetSet('RecordVersion', 234);

        $controllerMock->schema($request);

        /** @var HTTPResponse $result */
        $result = $controllerMock->getResponse();
        $this->assertSame('application/json', $result->getHeader('Content-Type'));
    }

    /**
     * @expectedException InvalidArgumentException
     * @expectedExceptionMessage Missing RecordID / RecordVersion / RecordClass for this form
     */
    public function testGetVersionFormThrowsExceptionWhenArgsAreMissing()
    {
        $controller = new HistoryViewerController();
        $controller->getVersionForm([]);
    }

    /**
     * @expectedException \SilverStripe\Control\HTTPResponse_Exception
     * @expectedExceptionCode 404
     */
    public function testGetVersionFormThrowsExceptionWhenArgsAreFalsy()
    {
        $controller = new HistoryViewerController();
        $controller->getVersionForm([
            'RecordClass' => 'Page',
            'RecordID' => 0,
            'RecordVersion' => 0,
        ]);
    }

    /**
     * @expectedException \SilverStripe\Control\HTTPResponse_Exception
     * @expectedExceptionCode 404
     */
    public function testGetVersionFormThrowsExceptionWhenRecordVersionDoesntExist()
    {
        $controller = new HistoryViewerController();
        $controller->getVersionForm([
            'RecordClass' => UnviewableVersionedObject::class,
            'RecordID' => 99999, // doesn't exist
            'RecordVersion' => 1,
        ]);
    }

    /**
     * @expectedException \SilverStripe\Control\HTTPResponse_Exception
     * @expectedExceptionCode 403
     * @expectedExceptionMessage You don't have the necessary permissions to view Unviewable Versioned Object
     */
    public function testGetVersionFormThrowsExceptionWhenCanViewIsFalse()
    {
        $controller = new HistoryViewerController();
        $controller->getVersionForm([
            'RecordClass' => UnviewableVersionedObject::class,
            'RecordID' => $this->idFromFixture(UnviewableVersionedObject::class, 'record_one'),
            'RecordVersion' => 1,
        ]);
    }

    public function testGetVersionFormReturnsForm()
    {
        $controller = new HistoryViewerController();
        $result = $controller->getVersionForm([
            'RecordClass' => UnviewableVersionedObject::class,
            'RecordID' => $this->idFromFixture(ViewableVersionedObject::class, 'record_one'),
            'RecordVersion' => 1,
        ]);

        $this->assertInstanceOf(Form::class, $result);
        $this->assertInstanceOf(LeftAndMainFormRequestHandler::class, $result->getRequestHandler());
    }

    /**
     * @expectedException \SilverStripe\Control\HTTPResponse_Exception
     * @expectedExceptionCode 400
     */
    public function testVersionFormThrowsExceptionWithoutRequest()
    {
        $controller = new HistoryViewerController();
        $controller->versionForm(null);
    }

    /**
     * @expectedException \SilverStripe\Control\HTTPResponse_Exception
     * @expectedExceptionCode 404
     */
    public function testVersionFormThrowsExceptionWhenArgsAreFalsy()
    {
        $controller = new HistoryViewerController();
        $controller->getVersionForm([
            'RecordClass' => 'Page',
            'RecordID' => 0,
            'RecordVersion' => 0,
        ]);
    }

    public function testVersionFormReturnsVersionForm()
    {
        $controllerMock = $this->getMockBuilder(HistoryViewerController::class)
            ->setMethods(['getVersionForm'])
            ->getMock();

        $mockData = [
            'RecordClass' => 'Page',
            'RecordID' => 123,
            'RecordVersion' => 234,
        ];

        $controllerMock->expects($this->once())->method('getVersionForm')
            ->with($mockData)
            ->willReturn('mocked');

        $result = $controllerMock->versionForm(new HTTPRequest('GET', '/', $mockData));

        $this->assertSame('mocked', $result);
    }
}
