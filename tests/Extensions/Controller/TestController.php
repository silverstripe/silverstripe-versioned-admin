<?php

namespace SilverStripe\VersionedAdmin\Tests\Extensions\Controller;

use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\Dev\TestOnly;
use SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest\ViewableVersionedObject;

class TestController extends ArchiveAdmin implements TestOnly
{
    private static $url_segment = 'test-archive';

    public function __construct($modelClass)
    {
        parent::__construct();
        $this->modelClass = $modelClass;
    }
}
