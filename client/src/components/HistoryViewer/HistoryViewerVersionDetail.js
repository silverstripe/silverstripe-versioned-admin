import React from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import { versionType } from 'types/versionType';

const HistoryViewerVersionDetail = (props) => {
  const { schemaUrl } = props;

  return (
    <div className="history-viewer__version-detail">
      <FormBuilderLoader
        identifier="HistoryViewer.VersionDetail"
        schemaUrl={schemaUrl}
      />
    </div>
  );
};

HistoryViewerVersionDetail.propTypes = {
  schemaUrl: React.PropTypes.string.isRequired,
  version: versionType.isRequired,
};

export default HistoryViewerVersionDetail;
