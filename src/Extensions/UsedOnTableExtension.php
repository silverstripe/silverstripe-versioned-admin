<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Admin\Forms\UsedOnTable;
use SilverStripe\Core\Extension;
use SilverStripe\Versioned\ChangeSetItem;

/**
 * @extends Extension<UsedOnTable>
 */
class UsedOnTableExtension extends Extension
{
    /**
     * @var array $excludedClasses
     */
    public function updateUsageExcludedClasses(array &$excludedClasses)
    {
        $excludedClasses[] = ChangeSetItem::class;
    }
}
