import React from 'react';
import Config from 'lib/Config';
import { inject } from 'lib/Injector';

const historyViewerConfig = (HistoryViewer) => {
  const HistoryViewerConfigProvider = (props) => {
    const getConfig = () => {
      const sectionKey = 'SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController';
      return Config.getSection(sectionKey);
    };

    const getSchemaUrlDetails = () => {
      const { compare } = props;
      if (compare) {
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
    };

    const getSchemaUrl = () => {
      const config = getConfig();
      const { formName, queryParts } = getSchemaUrlDetails();
      const schemaUrlBase = `${config.form[formName].schemaUrl}/:id`;
      const schemaUrlQuery = queryParts.concat('RecordClass=:class&RecordID=:id').join('&');
      return `${schemaUrlBase}?${schemaUrlQuery}`;
    };

    const componentProps = {
      ...props,
      config: getConfig(),
      HistoryViewer,
      schemaUrl: getSchemaUrl(),
    };

    return (
      <HistoryViewer
        {...componentProps}
      />
    );
  };

  return inject(
    ['HistoryViewer']
  )(HistoryViewerConfigProvider);
};

export default historyViewerConfig;
