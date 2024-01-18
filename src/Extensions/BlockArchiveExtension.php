<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use DNADesign\Elemental\Models\BaseElement;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\ORM\DataExtension;
use SilverStripe\ORM\FieldType\DBDatetime;
use SilverStripe\Security\Member;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Interfaces\ArchiveViewProvider;

/**
 * Adds a archive view for Elemental blocks
 *
 * @extends DataExtension<BaseElement>
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
            'Type' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_TYPE', 'Type'),
            'Versions.first.LastEdited' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_DATEARCHIVED',
                'Date Archived'
            ),
            'Breadcrumbs' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ORIGIN', 'Origin'),
            'Versions.first.Author.Name' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ARCHIVEDBY',
                'Archived By'
            )
        ]);
        $listColumns->setFieldFormatting([
            'Breadcrumbs' => function ($val, $item) {
                $parent = $item->Page;

                return ($parent && $parent->hasMethod('Breadcrumbs')) ? $parent->Breadcrumbs() : null;
            },
            'Versions.first.LastEdited' => function ($val, $item) {
                return DBDatetime::create_field('Datetime', $val)->Ago();
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
