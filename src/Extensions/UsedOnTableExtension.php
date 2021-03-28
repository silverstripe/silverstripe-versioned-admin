<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Core\Extension;
use SilverStripe\Versioned\ChangeSetItem;

class UsedOnTableExtension extends Extension
{
    /**
     * @var array
     */
    public function updateUsageExcludedClasses(array &$excludedClasses)
    {
        $excludedClasses[] = ChangeSetItem::class;
    }
}
