<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Core\Extension;
use SilverStripe\ORM\FieldType\DBDatetime;
use SilverStripe\Security\Member;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Interfaces\ArchiveViewProvider;

/**
 * Adds a archive view for Pages
 *
 * @extends Extension<SiteTree>
 */
class SiteTreeArchiveExtension extends Extension implements ArchiveViewProvider
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
            'LastEdited' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_DATEARCHIVED',
                'Date Archived'
            ),
            'ParentID' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ORIGIN', 'Origin'),
            'Author.Name' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ARCHIVEDBY',
                'Archived By'
            )
        ]);
        $listColumns->setFieldFormatting([
            'ParentID' => function ($val, $item) {
                if (SiteTree::get()->setUseCache(true)->byID($val)) {
                    $breadcrumbs = SiteTree::get()->setUseCache(true)->byID($val)->getBreadcrumbItems(2);
                    $breadcrumbString = '../';
                    foreach ($breadcrumbs as $item) {
                        $breadcrumbString = $breadcrumbString . $item->URLSegment . '/';
                    };
                    return $breadcrumbString;
                }
            },
            'LastEdited' => function ($val, $item) {
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
