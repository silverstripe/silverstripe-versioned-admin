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
      const schemaUrlBase = `${this.getConfig().form.versionForm.schemaUrl}/:id`;
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
