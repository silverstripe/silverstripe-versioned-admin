<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Assets\AssetControlExtension;
use SilverStripe\Assets\File;
use SilverStripe\Core\Config\Config;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\ORM\DataExtension;
use SilverStripe\ORM\FieldType\DBDatetime;
use SilverStripe\Versioned\GridFieldRestoreAction;
use SilverStripe\VersionedAdmin\ArchiveAdmin;
use SilverStripe\VersionedAdmin\Forms\GridField\GridFieldFileRestoreAction;
use SilverStripe\VersionedAdmin\Interfaces\ArchiveViewProvider;

/**
 * Adds a archive view for Files
 *
 * @extends DataExtension<File>
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

        $list = $listField->getList();
        // Paginator reports all records even if some can't be viewed, so we filter them out here
        $list = $list->filterByCallback(function ($item) {
            return $item->canView();
        });
        $listField->setList($list);
        $listConfig = $listField->getConfig();
        $listConfig->removeComponentsByType(GridFieldRestoreAction::class);
        $listConfig->addComponent(new GridFieldFileRestoreAction());

        $listColumns = $listField->getConfig()->getComponentByType(GridFieldDataColumns::class);
        $listColumns->setDisplayFields([
            'Name' => File::singleton()->fieldLabel('Name'),
            'appCategory' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_TYPE', 'Type'),
            'Versions.first.LastEdited' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_DATEARCHIVED',
                'Date Archived'
            ),
            'Parent.Name' => _t('SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ORIGIN', 'Origin'),
            'Versions.first.Author.Name' => _t(
                'SilverStripe\\VersionedAdmin\\ArchiveAdmin.COLUMN_ARCHIVEDBY',
                'Archived By'
            )
        ]);
        $listColumns->setFieldFormatting([
            'appCategory' => function ($val, $item) {
                return ucfirst($val ?: $item->i18n_singular_name());
            },
            'Versions.first.LastEdited' => function ($val, $item) {
                return DBDatetime::create_field('Datetime', $val)->Ago();
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
        // This should really only check File.keep_archived_assets, though it was originally
        // only checking AssetControlExtension.keep_archived_assets, so keeping that for BC
        return Config::inst()->get(AssetControlExtension::class, 'keep_archived_assets')
          || Config::inst()->get(File::class, 'keep_archived_assets');
    }
}
