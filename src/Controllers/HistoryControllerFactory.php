<?php
/**
 *
 */

namespace SilverStripe\VersionedAdmin\Controllers;

use SilverStripe\CMS\Controllers\CMSPageHistoryController;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Core\Extensible;
use SilverStripe\Core\Injector\Factory;
use SilverStripe\Core\Injector\Injector;

class HistoryControllerFactory implements Factory
{
    use Extensible;

    public function create($service, array $params = array())
    {
        $request = Injector::inst()->get(HTTPRequest::class);
        $id = $request->param('ID');

        if ($id) {
            $page = SiteTree::get()->byID($id);
            if ($page && $this->isEnabled($page)) {
                return Injector::inst()->create(CMSPageHistoryViewerController::class);
            }
        }

        // Injector is not used to prevent an infinite loop
        return new CMSPageHistoryController();
    }

    /**
     * Only activate for pages that have a history viewer capability applied. Extensions can provide their
     * own two cents about this criteria.
     *
     * @param SiteTree $record
     * @return bool
     */
    public function isEnabled(SiteTree $record)
    {
        $enabledResults = array_filter($this->extend('updateIsEnabled', $record));
        return (!empty($enabledResults) && max($enabledResults) === true);
    }

}
