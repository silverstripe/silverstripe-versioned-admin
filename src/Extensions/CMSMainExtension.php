<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;

class CMSMainExtension extends Extension
{
    /**
     * Inject the history viewer client requirements whenever accessing a CMS controller, ensuring
     * that they're always available for when the JS injector requires them
     */
    public function init()
    {
        Requirements::javascript('silverstripe/versioned-admin:client/dist/js/bundle.js');
        Requirements::css('silverstripe/versioned-admin:client/dist/styles/bundle.css');
    }
}
