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
use SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest\TestVersionedObject;
use SilverStripe\Dev\FunctionalTest;
use SilverStripe\Security\SecurityToken;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Forms\HistoryViewerField;

class HistoryViewerControllerTest extends FunctionalTest
{
    protected static $fixture_file = 'HistoryViewerControllerTest.yml';

    protected static $extra_dataobjects = [
        ViewableVersionedObject::class,
        UnviewableVersionedObject::class,
        TestVersionedObject::class,
    ];

    private $securityTokenWasEnabled = false;

    protected function setUp(): void
    {
        parent::setUp();
        $this->logInWithPermission('ADMIN');
        // CSRF token check is normally disabled for unit-tests
        $this->securityTokenWasEnabled = SecurityToken::is_enabled();
        if (!$this->securityTokenWasEnabled) {
            SecurityToken::enable();
        }
        TestVersionedObject::$fail = '';
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        if (!$this->securityTokenWasEnabled) {
            SecurityToken::disable();
        }
    }

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

        $controllerMock->expects($this->exactly(2))->method('getSchemaResponse')->willReturn(new HTTPResponse());

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
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/Missing required field/');
        $controller = new HistoryViewerController();
        $controller->getVersionForm([]);
    }

    public function testGetVersionFormThrowsExceptionWhenArgsAreFalsy()
    {
        $this->expectException(\InvalidArgumentException::class);
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
        $this->expectExceptionCode(404);
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
        $this->expectExceptionCode(403);
        $this->expectExceptionMessage("You don't have the necessary permissions to view Unviewable Versioned Object");
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
        $this->expectExceptionCode(400);
        $controller = new HistoryViewerController();
        $controller->versionForm(null);
    }

    public function testCompareFormThrowsExceptionWithoutRequest()
    {
        $this->expectException(\SilverStripe\Control\HTTPResponse_Exception::class);
        $this->expectExceptionMessage(400);
        $controller = new HistoryViewerController();
        $controller->compareForm(null);
    }

    public function testVersionFormThrowsExceptionWhenArgsAreFalsy()
    {
        $this->expectException(\InvalidArgumentException::class);
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

    public function provideApiRead(): array
    {
        return [
            'Valid' => [
                'idType' => 'existing',
                'fail' => '',
                'expectedCode' => 200,
            ],
            'Reject fail canView()' => [
                'idType' => 'existing',
                'fail' => 'can-view',
                'expectedCode' => 403,
            ],
            'Reject invalid ID' => [
                'idType' => 'invalid',
                'fail' => '',
                'expectedCode' => 404,
            ],
            'Reject missing ID' => [
                'idType' => 'missing',
                'fail' => '',
                'expectedCode' => 404,
            ],
            'Reject non-numeric ID' => [
                'idType' => 'non-numeric',
                'fail' => '',
                'expectedCode' => 404,
            ],
            'Reject new record ID' => [
                'idType' => 'new-record',
                'fail' => '',
                'expectedCode' => 404,
            ],
            'Reject no-class' => [
                'idType' => 'existing',
                'fail' => 'no-class',
                'expectedCode' => 400,
            ],
            'Reject invalid-class' => [
                'idType' => 'existing',
                'fail' => 'invalid-class',
                'expectedCode' => 400,
            ],
            'Reject unversioned-class' => [
                'idType' => 'existing',
                'fail' => 'unversioned-class',
                'expectedCode' => 400,
            ],
        ];
    }

    /**
     * @dataProvider provideApiRead
     */
    public function testApiRead(
        string $idType,
        string $fail,
        int $expectedCode
    ): void {
        if ($fail === 'unversioned-class') {
            TestVersionedObject::remove_extension(Versioned::class);
        }
        try {
            TestVersionedObject::$fail = $fail;
            $fixture = $this->getFixture();
            $fixture->Title = 'TestElementContent01 Title B';
            $fixture->write();
            $fixture->Title = 'TestElementContent01 Title C';
            $fixture->write();
            $id = $this->getID($idType);
            HistoryViewerField::config()->set('default_page_size', 2);
            $lastEdited = [];
            $versions = Versioned::get_all_versions(get_class($fixture), $fixture->ID);
            foreach ($versions as $version) {
                $lastEdited[$version->Version] = $version->LastEdited;
            }
            for ($page = 1; $page <= 3; $page++) {
                $qsa = [];
                if ($id !== -1) {
                    $qsa[] = "id=$id";
                }
                if ($fail !== 'no-class') {
                    $qsa[] = "dataClass=" . match ($fail) {
                        'invalid-class' => 'jellybean',
                        default => urlencode(get_class($fixture)),
                    };
                }
                $qsa[] = "page=$page";
                $qs = implode('&', $qsa);
                $url = "/admin/historyviewer/api/read?$qs";
                $response = $this->mainSession->sendRequest('GET', $url, []);
                $this->assertSame('application/json', $response->getHeader('Content-type'));
                $this->assertSame($expectedCode, $response->getStatusCode());
                if ($expectedCode === 200) {
                    if ($page === 1) {
                        $expected = [
                            'pageInfo' => [
                                'totalCount' => 3,
                            ],
                            'versions' => [
                                [
                                    'version' => 3,
                                    'absoluteLink' => '',
                                    'author' => [
                                        'firstName' => 'ADMIN',
                                        'surname' => 'User',
                                    ],
                                    'publisher' => [
                                        'firstName' => '',
                                        'surname' => '',
                                    ],
                                    'deleted' => false,
                                    'draft' => true,
                                    'published' => false,
                                    'liveVersion' => false,
                                    'latestDraftVersion' => true,
                                    'lastEdited' => $lastEdited[3],
                                ],
                                [
                                    'version' => 2,
                                    'absoluteLink' => '',
                                    'author' => [
                                        'firstName' => 'ADMIN',
                                        'surname' => 'User',
                                    ],
                                    'publisher' => [
                                        'firstName' => '',
                                        'surname' => '',
                                    ],
                                    'deleted' => false,
                                    'draft' => true,
                                    'published' => false,
                                    'liveVersion' => false,
                                    'latestDraftVersion' => false,
                                    'lastEdited' => $lastEdited[2],
                                ],
                            ],
                        ];
                    } elseif ($page === 2) {
                        $expected = [
                            'pageInfo' => [
                                'totalCount' => 3,
                            ],
                            'versions' => [
                                [
                                    'version' => 1,
                                    'absoluteLink' => '',
                                    'author' => [
                                        'firstName' => '',
                                        'surname' => '',
                                    ],
                                    'publisher' => [
                                        'firstName' => '',
                                        'surname' => '',
                                    ],
                                    'deleted' => false,
                                    'draft' => true,
                                    'published' => false,
                                    'liveVersion' => false,
                                    'latestDraftVersion' => false,
                                    'lastEdited' => $lastEdited[1],
                                ],
                            ],
                        ];
                    } else {
                        $expected = [
                            'pageInfo' => [
                                'totalCount' => 3,
                            ],
                            'versions' => [],
                        ];
                    }
                    $json = json_decode($response->getBody(), true);
                    $this->assertSame($expected, $json);
                }
            }
        } finally {
            // reset the extension as it will affect other tests
            if ($fail === 'unversioned-class') {
                TestVersionedObject::add_extension(Versioned::class);
            }
        }
    }

    public function provideApiRevert(): array
    {
        return [
            'Valid' => [
                'idType' => 'existing',
                'fail' => '',
                'expectedCode' => 204,
            ],
            'Reject fail canEdit()' => [
                'idType' => 'existing',
                'fail' => 'can-edit',
                'expectedCode' => 403,
            ],
            'Reject fail csrf-token' => [
                'idType' => 'existing',
                'fail' => 'csrf-token',
                'expectedCode' => 400,
            ],
            'Reject invalid ID' => [
                'idType' => 'invalid',
                'fail' => '',
                'expectedCode' => 400,
            ],
            'Reject missing ID' => [
                'idType' => 'missing',
                'fail' => '',
                'expectedCode' => 400,
            ],
            'Reject non-numeric ID' => [
                'idType' => 'non-numeric',
                'fail' => '',
                'expectedCode' => 400,
            ],
            'Reject new record ID' => [
                'idType' => 'new-record',
                'fail' => '',
                'expectedCode' => 400,
            ],
            'Reject no-class' => [
                'idType' => 'existing',
                'fail' => 'no-class',
                'expectedCode' => 400,
            ],
            'Reject invalid-class' => [
                'idType' => 'existing',
                'fail' => 'invalid-class',
                'expectedCode' => 400,
            ],
            'Reject unversioned-class' => [
                'idType' => 'existing',
                'fail' => 'unversioned-class',
                'expectedCode' => 400,
            ],
            'Reject no-to-version' => [
                'idType' => 'existing',
                'fail' => 'no-to-version',
                'expectedCode' => 400,
            ],
            'Reject invalid-to-version' => [
                'idType' => 'existing',
                'fail' => 'invalid-to-version',
                'expectedCode' => 400,
            ],
        ];
    }

    /**
     * @dataProvider provideApiRevert
     */
    public function testApiRevert(
        string $idType,
        string $fail,
        int $expectedCode
    ): void {
        if ($fail === 'unversioned-class') {
            TestVersionedObject::remove_extension(Versioned::class);
        }
        try {
            TestVersionedObject::$fail = $fail;
            $id = $this->getID($idType);
            $fixture = $this->getFixture();
            $fixture->Title = 'TestElementContent01 Title B';
            $fixture->write();
            $fixture->Title = 'TestElementContent01 Title C';
            $fixture->write();
            $data = [];
            if ($id !== -1) {
                $data['id'] = $id;
            }
            if ($fail !== 'no-class') {
                $data['dataClass'] = match ($fail) {
                    'invalid-class' => 'jellybean',
                    default => get_class($fixture),
                };
            }
            if ($fail !== 'no-to-version') {
                $data['toVersion'] = match ($fail) {
                    'invalid-to-version' => 99,
                    default => 2,
                };
            }
            $url = "/admin/historyviewer/api/revert";
            $headers = [];
            if ($fail !== 'csrf-token') {
                $headers = array_merge($headers, $this->getCsrfTokenheader());
            }
            $body = json_encode($data);
            $response = $this->mainSession->sendRequest('POST', $url, [], $headers, null, $body);
            $this->assertSame('application/json', $response->getHeader('Content-type'));
            $this->assertSame($expectedCode, $response->getStatusCode());
            $body = $response->getBody();
            // refetch from the database
            $obj = TestVersionedObject::get()->byID($fixture->ID);
            if ($expectedCode === 204) {
                $this->assertSame('TestElementContent01 Title B', $obj->Title);
            }
        } finally {
            // reset the extension as it will affect other tests
            if ($fail === 'unversioned-class') {
                TestVersionedObject::add_extension(Versioned::class);
            }
        }
    }

    private function getFixture(): TestVersionedObject
    {
        return $this->objFromFixture(TestVersionedObject::class, 'TestVersionedObject01');
    }

    private function getID(string $idType): mixed
    {
        $obj = $this->getFixture();
        return match ($idType) {
            'existing' => $obj->ID,
            'invalid' => $obj->ID + 99999,
            'missing' => -1,
            'non-numeric' => 'fish',
            'new-record' => 0,
        };
    }

    private function getCsrfTokenheader(): array
    {
        $securityToken = SecurityToken::inst();
        return [
            'X-' . $securityToken->getName() => $securityToken->getSecurityID()
        ];
    }
}
