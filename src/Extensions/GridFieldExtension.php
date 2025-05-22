<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\ORM\DataList;
use SilverStripe\VersionedAdmin\ArchiveAdmin;

class GridFieldExtension extends Extension
{
    protected function onBeforeRenderHolder(GridField $gridField, array $properties): void
    {
        $controller = $gridField->getForm()?->getController();
        if (!$controller || !is_a($controller, ArchiveAdmin::class)) {
            return;
        }
        $list = $gridField->getManipulatedList();
        if (!is_a($list, DataList::class)) {
            return;
        }
        $list->prepopulateCaches();
    }
}
