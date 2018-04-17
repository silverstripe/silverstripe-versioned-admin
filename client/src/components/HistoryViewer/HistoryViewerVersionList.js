import React, { PureComponent } from 'react';
import classnames from 'classnames';
import HistoryViewerHeading from './HistoryViewerHeading';
import HistoryViewerVersion from './HistoryViewerVersion';
import { versionType } from 'types/versionType';

class HistoryViewerVersionList extends PureComponent {
  /**
   * Return a string of HTML class names for the table element
   *
   * @returns {string}
   */
  getClassNames() {
    const { extraClass } = this.props;
    return classnames({ table: true }, extraClass);
  }

  render() {
    const { isActive, versions, onSelect } = this.props;

    return (
      <table className={this.getClassNames()}>
        <thead>
          <HistoryViewerHeading />
        </thead>
        <tbody>
          {
            versions.map((version) => (
              <HistoryViewerVersion
                key={version.Version}
                isActive={isActive}
                version={version}
                onSelect={onSelect}
              />
            ))
          }
        </tbody>
      </table>
    );
  }
}

HistoryViewerVersionList.propTypes = {
  extraClass: React.PropTypes.string,
  isActive: React.PropTypes.bool,
  onSelect: React.PropTypes.func,
  versions: React.PropTypes.arrayOf(versionType),
};

HistoryViewerVersionList.defaultProps = {
  extraClass: 'table-hover',
  isActive: false,
  versions: [],
};

export default HistoryViewerVersionList;
