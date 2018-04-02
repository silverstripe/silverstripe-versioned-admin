import React from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import HistoryViewerVersionList from './HistoryViewerVersionList';
import { versionType } from 'types/versionType';

const HistoryViewerVersionDetail = (props) => {
  const { schemaUrl, version } = props;

  return (
    <div className="history-viewer">
      <HistoryViewerVersionList
        extraClass="history-viewer__table--current"
        versions={[version]}
        isActive
      />

      <div className="history-viewer__version-detail">
        <FormBuilderLoader
          identifier="HistoryViewer.VersionDetail"
          schemaUrl={schemaUrl}
        />
      </div>
    </div>
  );
};

HistoryViewerVersionDetail.propTypes = {
  schemaUrl: React.PropTypes.string.isRequired,
  version: versionType.isRequired,
};

export default HistoryViewerVersionDetail;
