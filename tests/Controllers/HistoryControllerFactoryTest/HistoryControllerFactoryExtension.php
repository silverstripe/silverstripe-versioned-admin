<?php
namespace SilverStripe\VersionedAdmin\Tests\Controller\HistoryControllerFactory;

use SilverStripe\Core\Extension;
use SilverStripe\Dev\TestOnly;

class HistoryControllerFactoryExtension extends Extension implements TestOnly
{
    public function updateIsEnabled($record)
    {
        // Only "enable" for the second fixture (from HistoryControllerFactoryTest.yml)
        return $record->Title === '2';
    }
}
