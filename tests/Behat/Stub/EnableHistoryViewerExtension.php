<?php

namespace SilverStripe\VersionedAdmin\Tests\Behat\Stub;

use SilverStripe\Core\Extension;
use SilverStripe\Dev\TestOnly;

class EnableHistoryViewerExtension extends Extension implements TestOnly
{
    public function updateIsEnabled()
    {
        return true;
    }
}
