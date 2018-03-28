import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadComponent } from 'lib/Injector';

/**
 * Uses entwine to inject the HistoryViewer React component into the DOM, when used
 * outside of a React context e.g. in the CMS
 */
jQuery.entwine('ss', ($) => {
  $('.js-injector-boot .history-viewer__container').entwine({
    onmatch() {
      const cmsContent = this.closest('.cms-content').attr('id');
      const context = (cmsContent)
        ? { context: cmsContent }
        : {};

      const HistoryViewerComponent = loadComponent('HistoryViewer', context);

      ReactDOM.render(
        <HistoryViewerComponent
          recordId={this.data('record-id')}
          limit={30}
          offset={0}
          page={0}
        />,
        this[0]
      );

      // Hide the CMS actions when in the history viewer
      $('.CMSPageHistoryViewerController .toolbar--south.cms-content-actions').hide();
    }
  });
});
