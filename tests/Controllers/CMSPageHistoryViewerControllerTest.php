<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers;

use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\Session;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\Form;
use SilverStripe\VersionedAdmin\Controllers\CMSPageHistoryViewerController;
use SilverStripe\VersionedAdmin\Forms\HistoryViewerField;

class CMSPageHistoryViewerControllerTest extends SapphireTest
{
    protected static $fixture_file = 'CMSPageHistoryViewerControllerTest.yml';

    public function testGetEditForm()
    {
        $id = $this->idFromFixture(SiteTree::class, 'page_one');

        $controller = CMSPageHistoryViewerController::create();

        $controller->setRequest(
            (new HTTPRequest('GET', '/'))
                ->setSession(new Session([]))
        );

        $result = $controller->getEditForm($id);
        $this->assertInstanceOf(Form::class, $result);

        $historyViewer = $result->Fields()->fieldByName('PageHistory');
        $this->assertInstanceOf(HistoryViewerField::class, $historyViewer, 'Field is injected');
        $this->assertSame($result, $historyViewer->getForm(), 'Correct form is injected');
    }
}
