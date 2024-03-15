<?php

namespace SilverStripe\VersionedAdmin\Extensions;

use SilverStripe\Assets\File;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\ORM\DataExtension;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\ValidationResult;
use SilverStripe\Versioned\RestoreAction;
use SilverStripe\Versioned\Versioned;
use SilverStripe\Versioned\VersionedGridFieldItemRequest;
use SilverStripe\VersionedAdmin\ArchiveAdmin;

/**
 * Adds a restore action to the item edit form of ArchiveAdmin
 *
 * @extends DataExtension<VersionedGridFieldItemRequest>
 */
class ArchiveRestoreAction extends DataExtension
{
    /**
     * Updates the edit form with a restore button if it is being viewed
     *
     * @param Form $form
     * @return mixed
     */
    public function updateItemEditForm(Form $form)
    {
        $record = $this->owner->getRecord();

        if ($this->shouldDisplayAction($record)) {
            $restoreToRoot = RestoreAction::shouldRestoreToRoot($record);

            $title = $restoreToRoot
                ? _t('SilverStripe\\Versioned\\RestoreAction.RESTORE_TO_ROOT', 'Restore to draft at top level')
                : _t('SilverStripe\\Versioned\\RestoreAction.RESTORE', 'Restore to draft');
            $description = $restoreToRoot
                ? _t(
                    'SilverStripe\\Versioned\\RestoreAction.RESTORE_TO_ROOT_DESC',
                    'Restore the archived version to draft as a top level item'
                )
                : _t(
                    'SilverStripe\\Versioned\\RestoreAction.RESTORE_DESC',
                    'Restore the archived version to draft'
                );

            $form->actions = FieldList::create(
                FormAction::create('doRestore', $title)
                    ->setDescription($description)
                    ->setAttribute('data-to-root', $restoreToRoot)
                    ->addExtraClass('btn-warning font-icon-back-in-time ArchiveAdmin__action--restore')
                    ->setUseButtonTag(true)
            );

            $form->unsetValidator();
        }
    }

    /**
     * Returns whether the restore action should be displayed
     *
     * @param $record
     * @return bool
     */
    protected function shouldDisplayAction($record)
    {
        $admin = $this->owner->popupController;
        // If the record is a File, check if the file binary was archived
        $hasFileSaved = $record instanceof File ? $record->exists() : true;
        return (
            $hasFileSaved &&
            $admin instanceof ArchiveAdmin &&
            DataObject::has_extension($record, Versioned::class) &&
            $record->canRestoreToDraft()
        );
    }

    /**
     * Restore the record to its original place or top level if that's not possible
     */
    public function doRestore(array $data, Form $form): HTTPResponse
    {
        $record = $this->owner->getRecord();

        $message = RestoreAction::restore($record);

        $controller = $this->owner->popupController;
        $controller->getRequest()->addHeader('X-Pjax', 'Content');
        $controller->getEditForm()->sessionMessage($message['text'], $message['type'], ValidationResult::CAST_HTML);

        return $controller->redirect($controller->Link());
    }
}
