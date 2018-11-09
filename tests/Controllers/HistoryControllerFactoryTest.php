<?php
namespace SilverStripe\VersionedAdmin\Tests\Controllers;

use SilverStripe\VersionedAdmin\Tests\Controller\HistoryControllerFactory\HistoryControllerFactoryExtension;
use SilverStripe\CMS\Controllers\CMSPageHistoryController;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\VersionedAdmin\Controllers\CMSPageHistoryViewerController;
use SilverStripe\VersionedAdmin\Controllers\HistoryControllerFactory;

class HistoryControllerFactoryTest extends SapphireTest
{
    protected static $fixture_file = 'HistoryControllerFactoryTest.yml';

    protected static $illegal_extensions = [
        HistoryControllerFactory::class => '*'
    ];

    protected static $required_extensions = [
        HistoryControllerFactory::class => [HistoryControllerFactoryExtension::class]
    ];

    public function testCreateController()
    {
        $factory = new HistoryControllerFactory;

        $controller = $factory->create(null);
        $this->assertInstanceOf(CMSPageHistoryViewerController::class, $controller);

        $this->mockRequest('page_one');
        $controller = $factory->create(null);
        $this->assertInstanceOf(CMSPageHistoryController::class, $controller);

        $this->mockRequest('page_two');
        $controller = $factory->create(null);
        $this->assertInstanceOf(CMSPageHistoryViewerController::class, $controller);

        $this->mockRequest('page_three');
        $controller = $factory->create(null);
        $this->assertInstanceOf(CMSPageHistoryViewerController::class, $controller);
    }

    private function mockRequest($identifier)
    {
        $id = $this->idFromFixture(SiteTree::class, $identifier);

        $mockRequest = new HTTPRequest('GET', '');
        $mockRequest->setRouteParams(['ID' => $id]);
        Injector::inst()->registerService($mockRequest);
    }
}
