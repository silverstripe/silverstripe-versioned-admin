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
        $this->assertArrayHasKey('compareForm', $clientConfig['form']);
        $this->assertArrayHasKey('schemaUrl', $clientConfig['form']['versionForm']);
    }

    public function testSchema()
    {
        $controllerMock = $this->getMockBuilder(HistoryViewerController::class)
            ->setMethods(['getVersionForm', 'getCompareForm', 'getSchemaResponse'])
            ->getMock();

        $controllerMock->expects($this->once())->method('getVersionForm')->with([
            'RecordClass' => 'Page',
            'RecordID' => 123,
            'RecordVersion' => 234,
            'RecordDate' => null
        ]);

        $controllerMock->expects($this->once())->method('getCompareForm')->with([
            'RecordClass' => 'Page',
            'RecordID' => 123,
            'RecordVersionFrom' => 234,
            'RecordVersionTo' => 236,
        ]);

        $controllerMock->expects($this->exactly(2))->method('getSchemaResponse')->willReturn(true);

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

        $request = $this->getMockBuilder(HTTPRequest::class)
            ->setConstructorArgs(['GET', '/'])
            ->setMethods(['param'])
            ->getMock();
        $request->expects($this->once())->method('param')->with('FormName')->willReturn('compareForm');
        $request->offsetSet('RecordClass', 'Page');
        $request->offsetSet('RecordID', 123);
        $request->offsetSet('RecordVersion', 234);
        $request->offsetSet('RecordVersionFrom', 234);
        $request->offsetSet('RecordVersionTo', 236);

        $controllerMock->schema($request);
        /** @var HTTPResponse $result */
        $result = $controllerMock->getResponse();
        $this->assertSame('application/json', $result->getHeader('Content-Type'));
    }

    public function testGetVersionFormThrowsExceptionWhenArgsAreMissing()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/Missing required field/');
        $controller = new HistoryViewerController();
        $controller->getVersionForm([]);
    }

    public function testGetVersionFormThrowsExceptionWhenArgsAreFalsy()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/Missing required field/');
        $controller = new HistoryViewerController();
        $controller->getVersionForm([
            'RecordClass' => 'Page',
            'RecordID' => 0,
            'RecordVersion' => 0,
        ]);
    }

    public function testGetVersionFormThrowsExceptionWhenRecordVersionDoesntExist()
    {
        $this->expectException(\SilverStripe\Control\HTTPResponse_Exception::class);
        $this->expectExceptionCode('404');
        $controller = new HistoryViewerController();
        $controller->getVersionForm([
            'RecordClass' => UnviewableVersionedObject::class,
            'RecordID' => 99999, // doesn't exist
            'RecordVersion' => 1,
        ]);
    }

    public function testGetVersionFormThrowsExceptionWhenCanViewIsFalse()
    {
        $this->expectException(\SilverStripe\Control\HTTPResponse_Exception::class);
        $this->expectExceptionCode('403');
        $this->expectExceptionMessage('You don\'t have the necessary permissions to view Unviewable Versioned Object');
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

    public function testVersionFormThrowsExceptionWithoutRequest()
    {
        $this->expectException(\SilverStripe\Control\HTTPResponse_Exception::class);
        $this->expectExceptionCode('400');
        $controller = new HistoryViewerController();
        $controller->versionForm(null);
    }

    public function testCompareFormThrowsExceptionWithoutRequest()
    {
        $this->expectException(\SilverStripe\Control\HTTPResponse_Exception::class);
        $this->expectExceptionCode('400');
        $controller = new HistoryViewerController();
        $controller->compareForm(null);
    }

    public function testVersionFormThrowsExceptionWhenArgsAreFalsy()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/Missing required field/');
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
