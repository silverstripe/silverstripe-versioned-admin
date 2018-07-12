<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Security\Member;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\ArchiveViewProvider;

/**
 * Adds a archive view for Pages
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
            'i18n_singular_name' => _t(ArchiveAdmin::class . '.COLUMN_TYPE', 'Type'),
            'LastEdited.Ago' => _t(ArchiveAdmin::class . '.COLUMN_DATEARCHIVED', 'Date Archived'),
            'ParentID' => _t(ArchiveAdmin::class . '.COLUMN_ORIGIN', 'Origin'),
            'AuthorID' => _t(ArchiveAdmin::class . '.COLUMN_ARCHIVEDBY', 'Archived By')
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
