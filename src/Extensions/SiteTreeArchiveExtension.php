<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\ORM\DataExtension;
use SilverStripe\ORM\FieldType\DBDatetime;
use SilverStripe\Security\Member;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Interfaces\ArchiveViewProvider;

/**
 * Adds a archive view for Pages
 *
 * @extends DataExtension<SiteTree>
 */
class SiteTreeArchiveExtension extends DataExtension implements ArchiveViewProvider
{
    /**
     * @inheritDoc
    */
    public function getArchiveFieldClass()
    {
        return SiteTree::class;
    }

    /**
     * @inheritDoc
    */
    public function getArchiveField()
    {
        $listField = ArchiveAdmin::createArchiveGridField('Pages', SiteTree::class);

        $listColumns = $listField->getConfig()->getComponentByType(GridFieldDataColumns::class);
        $listColumns->setDisplayFields([
            'Title' => SiteTree::singleton()->fieldLabel('Title'),
            'i18n_singular_name' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_TYPE', 'Type'),
            'Versions.first.LastEdited' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_DATEARCHIVED',
                'Date Archived'
            ),
            'ParentID' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ORIGIN', 'Origin'),
            'Versions.first.Author.Name' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ARCHIVEDBY',
                'Archived By'
            )
        ]);
        $listColumns->setFieldFormatting([
            'ParentID' => function ($val, $item) {
                if (SiteTree::get_by_id($val)) {
                    $breadcrumbs = SiteTree::get_by_id($val)->getBreadcrumbItems(2);
                    $breadcrumbString = '../';
                    foreach ($breadcrumbs as $item) {
                        $breadcrumbString = $breadcrumbString . $item->URLSegment . '/';
                    };
                    return $breadcrumbString;
                }
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
