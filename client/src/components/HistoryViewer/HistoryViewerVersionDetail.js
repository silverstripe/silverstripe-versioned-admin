import React, { PropTypes, PureComponent } from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import { inject } from 'lib/Injector';
import { versionType } from 'types/versionType';

class HistoryViewerVersionDetail extends PureComponent {
  render() {
    const { ListComponent, schemaUrl, version } = this.props;

    return (
      <div className="history-viewer">
        <ListComponent
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
  }
}

HistoryViewerVersionDetail.propTypes = {
  ListComponent: PropTypes.func,
  schemaUrl: React.PropTypes.string.isRequired,
  version: versionType.isRequired,
};

export { HistoryViewerVersionDetail as Component };

export default inject(
  ['HistoryViewerVersionList'],
  (HistoryViewerVersionList) => ({ ListComponent: HistoryViewerVersionList })
)(HistoryViewerVersionDetail);
