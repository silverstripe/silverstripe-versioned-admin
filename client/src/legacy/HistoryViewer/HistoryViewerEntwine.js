import jQuery from 'jquery';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { loadComponent } from 'lib/Injector';

/**
 * Uses entwine to inject the HistoryViewer React component into the DOM, when used
 * outside of a React context e.g. in the CMS
 */
jQuery.entwine('ss', ($) => {
  $('.js-injector-boot .history-viewer__container').entwine({
    ReactRoot: null,

    onmatch() {
      const cmsContent = this.closest('.cms-content').attr('id');
      const context = (cmsContent)
        ? { context: cmsContent }
        : {};

      const HistoryViewerComponent = loadComponent('HistoryViewer', context);
      const schemaData = this.data('schema');

      const props = {
        ...schemaData.data,
        // If the HistoryViewerField is instantiated via a GridFieldDetailForm, it will not
        // have this class attached (see CMSPageHistoryViewerController).
        isInGridField: schemaData.data.isInGridField || !this.hasClass('history-viewer--standalone'),
      };

      const root = createRoot(this[0]);
      root.render(<HistoryViewerComponent {...props} />);
      this.setReactRoot(root);
    },

    onunmatch() {
      const root = this.getReactRoot();
      if (root) {
        root.unmount();
        this.setReactRoot(null);
      }
    }
  });

  // Prevent the default anchor behaviour for any CMS tab links that are rendered in
  // via a React FormBuilder
  $('.history-viewer__version-detail .nav-link').entwine({
    onclick(e) {
      e.preventDefault();
      this._super(e);
    }
  });

  // Work arounds for the CMS not rendering entirely in react yet
  // When loading from e.g. GridFieldDetailForm both button sets
  // save/publish _and_ the "revert" button were rendered.
  // Enabling this functionality requires a developer to add
  // $tab->addExtraClass('tab--history-viewer')
  // to the tab the HistoryViewerField is rendered into.
  // c.f. dnadesign/silverstripe-elemental BaseElement::getCMSFields
  $('.tab.tab--history-viewer[aria-hidden=false]').entwine({
    onmatch() {
      $('.toolbar--south.cms-content-actions').hide();
    },
    onunmatch() {
      $('.toolbar--south.cms-content-actions').show();
    }
  });
  $('.tab.tab--history-viewer .history-viewer__version-detail').entwine({
    onmatch() {
      this
        .parent()
        .css('padding-bottom', '3rem')
        .next('.toolbar--south')
        .css({
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        });
    }
  });
});
