<?php

namespace SilverStripe\VersionedAdmin\Controllers;

use SilverStripe\CMS\Controllers\CMSMain;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HiddenField;
use SilverStripe\VersionedAdmin\Forms\HistoryViewerField;

if (!class_exists(CMSMain::class)) {
    return;
}

/**
 * The history viewer controller uses the React based {@link HistoryViewerField} to
 * display the history for a {@link DataObject} that has the {@link Versioned}
 * extension.
 */
class CMSPageHistoryViewerController extends CMSMain
{
    private static $url_segment = 'pages/history';

    private static $url_rule = '/$Action/$ID/$VersionID/$OtherVersionID';

    private static $url_priority = 43;

    private static $required_permission_codes = 'CMS_ACCESS_CMSMain';

    public function getEditForm($id = null, $fields = null)
    {
        $record = $this->getRecord($id ?: $this->currentPageID());

        $form = parent::getEditForm($id);
        $form->addExtraClass('history-viewer__form');
        // Disable default CMS preview
        $form->removeExtraClass('cms-previewable');

        if ($record) {
            $fieldList = FieldList::create(
                HiddenField::create('ID', null, $record->ID),
                HistoryViewerField::create('PageHistory')
                    ->addExtraClass('history-viewer--standalone')
                    ->setForm($form)
            );
            $form->setFields($fieldList);
        }

        return $form;
    }

    public function getTabIdentifier()
    {
        return 'history';
    }
}
