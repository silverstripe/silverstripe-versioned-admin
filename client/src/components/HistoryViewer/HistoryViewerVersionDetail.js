import React, { PureComponent } from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import HistoryViewerVersionList from './HistoryViewerVersionList';
import { versionType } from 'types/versionType';

class HistoryViewerVersionDetail extends PureComponent {
  render() {
    const { onSelect, schemaUrl, version } = this.props;

    return (
      <div className="history-viewer">
        <HistoryViewerVersionList
          extraClass="history-viewer__table--current"
          versions={[version]}
          onSelect={onSelect}
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
  }
}

HistoryViewerVersionDetail.propTypes = {
  schemaUrl: React.PropTypes.string.isRequired,
  onSelect: React.PropTypes.func,
  version: versionType.isRequired,
};

export default HistoryViewerVersionDetail;
