/**
 * File: ArchiveAdmin.js
 */
import jQuery from 'jquery';

jQuery.entwine('ss', ($) => {
  $('.ArchiveAdmin__action--restore').entwine({
    onmatch() {
      $(this).attr('readonly', false);
      $(this).attr('disabled', false);
    }
  });

  $('.ArchiveAdmin .other-model-selector select').entwine({
    /**
     * Reacts to the user changing the content type.
     */
    onchange(e) {
      e.preventDefault();

      let targetClassName = $(this).val();
      const othersArchiveUrl = $(this).data('others-archive-url');
      if (targetClassName) {
        targetClassName = targetClassName.replace(/\\/g, '-');
        const url = othersArchiveUrl + targetClassName;

        $('.cms-container').loadPanel(url, '', { pjax: 'CurrentForm' });
      }
    }
  });
});
