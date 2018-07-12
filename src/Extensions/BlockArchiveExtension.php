<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use DNADesign\Elemental\Models\BaseElement;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Security\Member;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\ArchiveViewProvider;

/**
 * Adds a archive view for Elemental blocks
 */
class BlockArchiveExtension extends DataExtension implements ArchiveViewProvider
{
    /**
     * @inheritDoc
    */
    public function getArchiveFieldClass()
    {
        return BaseElement::class;
    }

    /**
     * @inheritDoc
    */
    public function getArchiveField()
    {
        $listField = ArchiveAdmin::createArchiveGridField('Blocks', BaseElement::class);

        $listColumns = $listField->getConfig()->getComponentByType(GridFieldDataColumns::class);
        $listColumns->setDisplayFields([
            'Title' => BaseElement::singleton()->fieldLabel('Title'),
            'Type' => _t(ArchiveAdmin::class . '.COLUMN_TYPE', 'Type'),
            'LastEdited.Ago' => _t(ArchiveAdmin::class . '.COLUMN_DATEARCHIVED', 'Date Archived'),
            'Breadcrumbs' => _t(ArchiveAdmin::class . '.COLUMN_ORIGIN', 'Origin'),
            'AuthorID' => _t(ArchiveAdmin::class . '.COLUMN_ARCHIVEDBY', 'Archived By')
        ]);
        $listColumns->setFieldFormatting([
            'Breadcrumbs' => function ($val, $item) {
                $parent = $item->Page;

                return $parent ? $parent->Breadcrumbs() : null;
            },
            'AuthorID' => function ($val, $item) {
                $member = Member::get_by_id($val);
                return $member ? $member->Name : null;
            },
        ]);

        return $listField;
    }

    /**
     * @inheritDoc
    */
    public function isArchiveFieldEnabled()
    {
        return true;
    }
}
