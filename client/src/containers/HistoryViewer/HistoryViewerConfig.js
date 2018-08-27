import React from 'react';
import Config from 'lib/Config';
import { inject } from 'lib/Injector';

const historyViewerConfig = (HistoryViewer) => {
  class HistoryViewerConfigProvider extends React.Component {
    getConfig() {
      const sectionKey = 'SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController';
      return Config.getSection(sectionKey);
    }

    getSchemaUrl() {
      // Get the URL up until any ? that may exist (removes query string args)
      const schemaUrl = this.getConfig().form.versionForm.schemaUrl.match(/([^\?]+)/)[0];
      const schemaUrlBase = `${schemaUrl}/:id`;
      const schemaQueryString = 'RecordClass=:class&RecordID=:id&RecordVersion=:version';
      return `${schemaUrlBase}?${schemaQueryString}`;
    }

    render() {
      const props = {
        ...this.props,
        config: this.getConfig(),
        HistoryViewer,
        schemaUrl: this.getSchemaUrl(),
      };

      return (
        <HistoryViewer
          {...props}
        />
      );
    }
  }

  return inject(
    ['HistoryViewer']
  )(HistoryViewerConfigProvider);
};

export default historyViewerConfig;
