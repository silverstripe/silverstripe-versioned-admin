<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Assets\AssetControlExtension;
use SilverStripe\Assets\File;
use SilverStripe\Core\Config\Config;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Security\Member;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\ArchiveViewProvider;

/**
 * Adds a archive view for Files
 */
class FileArchiveExtension extends DataExtension implements ArchiveViewProvider
{
    /**
     * @inheritDoc
    */
    public function getArchiveFieldClass()
    {
        return File::class;
    }

    /**
     * @inheritDoc
    */
    public function getArchiveField()
    {
        $listField = ArchiveAdmin::createArchiveGridField('Files', File::class);

        $listColumns = $listField->getConfig()->getComponentByType(GridFieldDataColumns::class);
        $listColumns->setDisplayFields([
            'Name' => File::singleton()->fieldLabel('Name'),
            'appCategory' => _t(ArchiveAdmin::class . '.COLUMN_TYPE', 'Type'),
            'LastEdited.Ago' => _t(ArchiveAdmin::class . '.COLUMN_DATEARCHIVED', 'Date Archived'),
            'Parent.Name' => _t(ArchiveAdmin::class . '.COLUMN_ORIGIN', 'Origin'),
            'AuthorID' => _t(ArchiveAdmin::class . '.COLUMN_ARCHIVEDBY', 'Archived By'),
        ]);
        $listColumns->setFieldFormatting([
            'appCategory' => function ($val, $item) {
                return ucfirst($val ?: $item->i18n_singular_name());
            },
            'AuthorID' => function ($val, $item) {
                $member = Member::get_by_id($val);
                return $member ? $member->Name : null;
            },
        ]);

        return $listField;
    }

    /**
     * The files archive is only useful if archived assets are stored
     * so this checks if this option is enabled
     *
     * @return boolean
    */
    public function isArchiveFieldEnabled()
    {
        return Config::inst()->get(AssetControlExtension::class, 'keep_archived_assets');
    }
}
