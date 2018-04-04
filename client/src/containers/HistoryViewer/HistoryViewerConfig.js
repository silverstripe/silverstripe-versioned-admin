import React from 'react';
import Config from 'lib/Config';

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
        schemaUrl: this.getSchemaUrl(),
      };

      return (
        <HistoryViewer
          {...props}
        />
      );
    }
  }

  return HistoryViewerConfigProvider;
};

export default historyViewerConfig;
