<?php
namespace SilverStripe\VersionedAdmin\Tests\Controllers;

use SilverStripe\Dev\Deprecation;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\CMS\Controllers\CMSPageHistoryController;
use SilverStripe\VersionedAdmin\Controllers\HistoryControllerFactory;
use SilverStripe\VersionedAdmin\Controllers\CMSPageHistoryViewerController;
use SilverStripe\VersionedAdmin\Tests\Controllers\HistoryControllerFactory\HistoryControllerFactoryExtension;

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
        if (Deprecation::isEnabled()) {
            $this->markTestSkipped('Test calls deprecated code');
        }
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
