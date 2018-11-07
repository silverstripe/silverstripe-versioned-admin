<?php
namespace SilverStripe\VersionedAdmin\Tests\Controller\HistoryControllerFactory;

use SilverStripe\Core\Extension;
use SilverStripe\Dev\TestOnly;

class HistoryControllerFactoryExtension extends Extension implements TestOnly
{
    public function updateIsEnabled($record)
    {
        // First fixture is explicitely disable (from HistoryControllerFactoryTest.yml)
        if ($record->Title === '1') {
            return false;
        }

        // second fixture is explicitely enable (from HistoryControllerFactoryTest.yml)
        if ($record->Title === '2') {
            return true;
        }
    }
}
