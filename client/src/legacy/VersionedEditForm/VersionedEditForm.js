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
      const message = 'Are you sure you want to remove your record from the published site?\n\nThis record will still be available in the CMS as draft.';

      if (confirm(message)) {
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
      const message = 'Warning: This record will be unpublished before being sent to the archive.\n\nAre you sure you want to proceed?';

      if (confirm(message)) {
        // Add a loading indicator and continue
        this.parents('form:first').addClass('loading');

        return this._super(e);
      }

      return false;
    }
  });
});
