import React from 'react';
import Config from 'lib/Config';
import { inject } from 'lib/Injector';

const historyViewerConfig = (HistoryViewer) => {
  class HistoryViewerConfigProvider extends React.Component {
    getConfig() {
      const sectionKey = 'SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController';
      return Config.getSection(sectionKey);
    }

    getSchemaUrlDetails() {
      const { compareMode } = this.props;
      if (compareMode) {
        return {
          formName: 'compareForm',
          queryParts: [
            'RecordVersionFrom=:from',
            'RecordVersionTo=:to',
          ],
        };
      }
      return {
        formName: 'versionForm',
        queryParts: [
          'RecordVersion=:version',
        ],
      };
    }

    getSchemaUrl() {
      const config = this.getConfig();
      const { formName, queryParts } = this.getSchemaUrlDetails();
      const schemaUrlBase = `${config.form[formName].schemaUrl}/:id`;
      const schemaUrlQuery = queryParts.concat('RecordClass=:class&RecordID=:id').join('&');
      return `${schemaUrlBase}?${schemaUrlQuery}`;
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
