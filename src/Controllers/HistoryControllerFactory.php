<?php

namespace SilverStripe\VersionedAdmin\Controllers;

use SilverStripe\CMS\Controllers\CMSPageHistoryController;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Core\Extensible;
use SilverStripe\Core\Injector\Factory;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Versioned\Versioned;

/**
 * The history controller factory decides which CMS history controller to use, out of the default from the
 * silverstripe/cms module or the history viewer controller from this module, depending on the current page type
 */
class HistoryControllerFactory implements Factory
{
    use Extensible;

    public function create($service, array $params = array())
    {
        // If no request is available yet, return the default controller
        if (!Injector::inst()->has(HTTPRequest::class)) {
            return new CMSPageHistoryController();
        }
        $request = Injector::inst()->get(HTTPRequest::class);
        $id = $request->param('ID');

        if ($id) {
            // Ensure we read from the draft stage at this position
            $originalStage = Versioned::get_stage();
            Versioned::set_stage(Versioned::DRAFT);
            $page = SiteTree::get()->byID($id);
            Versioned::set_stage($originalStage);

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
