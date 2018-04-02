import React, { PureComponent } from 'react';
import HistoryViewerHeading from './HistoryViewerHeading';
import HistoryViewerVersion from './HistoryViewerVersion';
import { versionType } from 'types/versionType';

class HistoryViewerVersionList extends PureComponent {
  render() {
    const { versions } = this.props;

    return (
      <table className="table table-hover">
        <thead>
          <HistoryViewerHeading />
        </thead>
        <tbody>
          {
            versions.map((version) => (
              <HistoryViewerVersion
                key={version.Version}
                handleClick={() => this.props.handleClickVersion(version.Version)}
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
  versions: React.PropTypes.arrayOf(versionType),
};

HistoryViewerVersionList.defaultProps = {
  versions: [],
};

export default HistoryViewerVersionList;
