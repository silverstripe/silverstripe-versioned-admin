<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Dev\Deprecation;
use SilverStripe\Core\Extension;

/**
 * @deprecated 1.2.0 Will be removed without equivalent functionality to replace it
 */
class CMSMainExtension extends Extension
{
    public function __construct()
    {
        Deprecation::notice(
            '1.2.0',
            'Will be removed without equivalent functionality to replace it',
            Deprecation::SCOPE_CLASS
        );
    }

    public function init()
    {
    }
}
