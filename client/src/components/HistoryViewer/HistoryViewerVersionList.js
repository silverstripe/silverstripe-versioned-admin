import React, { PureComponent } from 'react';
import HistoryViewerHeading from 'components/HistoryViewer/HistoryViewerHeading';
import HistoryViewerVersion from 'components/HistoryViewer/HistoryViewerVersion';

class HistoryViewerVersionList extends PureComponent {
  render() {
    return (
      <table className="table table-hover">
        <thead>
          <HistoryViewerHeading />
        </thead>
        <tbody>
          {
            this.props.versions.map((version) => (
              <HistoryViewerVersion
                version={version}
              />
            ))
          }
        </tbody>
      </table>
    );
  }
}

HistoryViewerVersionList.propTypes = {
  versions: React.PropTypes.array,
};

HistoryViewerVersionList.defaultProps = {
  versions: [],
};

export default HistoryViewerVersionList;
