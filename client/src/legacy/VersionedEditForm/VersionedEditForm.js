import i18n from 'i18n';
import jQuery from 'jquery';

jQuery.entwine('ss', ($) => {
  /**
   * Class: .cms-edit-form .btn-toolbar #Form_ItemEditForm_action_doUnpublish
   * Informing the user about the unpublish action while requiring confirmation
   */
  $('.cms-edit-form .btn-toolbar #Form_ItemEditForm_action_doUnpublish').entwine({

    /**
     * Function: onclick
     *
     * Parameters:
     *  (Event) e
     */
    onclick(e) {
      const message = i18n._t(
        'VersionedEditForm.PUBLISH_CONFIRM_MESSAGE',
        'Are you sure you want to remove your record from the published site?\n\nThis record will still be available in the CMS as draft.'
      );

      if (confirm(message)) { // eslint-disable-line no-alert
        // Add a loading indicator and continue
        this.parents('form:first').addClass('loading');

        return this._super(e);
      }

      return false;
    }
  });

  /**
   * Class: .cms-edit-form .btn-toolbar #Form_ItemEditForm_action_doArchive
   *
   * Informing the user about the archive action while requiring confirmation
   */
  $('.cms-edit-form .btn-toolbar #Form_ItemEditForm_action_doArchive').entwine({
    /**
     * Function: onclick
     *
     * Parameters:
     *  (Event) e
     */
    onclick(e) {
      const message = i18n._t(
        'VersionedEditForm.ARCHIVE_CONFIRM_MESSAGE',
        'Warning: This record will be unpublished before being sent to the archive.\n\nAre you sure you want to proceed?'
      );

      if (confirm(message)) { // eslint-disable-line no-alert
        // Add a loading indicator and continue
        this.parents('form:first').addClass('loading');

        return this._super(e);
      }

      return false;
    }
  });
});
