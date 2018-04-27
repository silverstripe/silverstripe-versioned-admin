<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest;

use SilverStripe\Dev\TestOnly;

class UnviewableVersionedObject extends ViewableVersionedObject implements TestOnly
{
    public function canView($member = null)
    {
        return false;
    }
}
