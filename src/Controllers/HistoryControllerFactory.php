<?php

namespace SilverStripe\VersionedAdmin\Controllers;

use SilverStripe\Dev\Deprecation;
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
 *
 * @deprecated 1.1.0 Will be removed without equivalent functionality to replace it
 */
class HistoryControllerFactory implements Factory
{
    use Extensible;

    public function __construct()
    {
        Deprecation::notice(
            '1.1.0',
            'Will be removed without equivalent functionality to replace it',
            Deprecation::SCOPE_CLASS
        );
    }

    public function create($service, array $params = array())
    {
        // If no request is available yet, return the default controller
        if (Injector::inst()->has(HTTPRequest::class)) {
            $request = Injector::inst()->get(HTTPRequest::class);
            $id = $request->param('ID');

            if ($id && is_numeric($id)) {
                // Ensure we read from the draft stage at this position
                $page = Versioned::get_one_by_stage(
                    SiteTree::class,
                    Versioned::DRAFT,
                    sprintf('"SiteTree"."ID" = \'%d\'', $id)
                );

                if ($page && !$this->isEnabled($page)) {
                    // Injector is not used to prevent an infinite loop
                    return new CMSPageHistoryController();
                }
            }
        }

        // Injector is not used to prevent an infinite loop
        return Injector::inst()->create(CMSPageHistoryViewerController::class);
    }

    /**
     * Only deactivate for pages that have a history viewer capability removed. Extensions can provide their
     * own two cents about this criteria.
     *
     * @param SiteTree $record
     * @return bool
     */
    public function isEnabled(SiteTree $record)
    {
        $enabledResults = $this->extend('updateIsEnabled', $record);
        return (empty($enabledResults) || min($enabledResults) !== false);
    }
}
