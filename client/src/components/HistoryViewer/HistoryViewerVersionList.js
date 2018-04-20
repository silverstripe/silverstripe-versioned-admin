import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { inject } from 'lib/Injector';
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
    const { HeadingComponent, isActive, VersionComponent, versions } = this.props;

    return (
      <table className={this.getClassNames()}>
        <thead>
          <HeadingComponent />
        </thead>
        <tbody>
          {
            versions.map((version) => (
              <VersionComponent
                key={version.Version}
                isActive={isActive}
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
  extraClass: PropTypes.string,
  HeadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  isActive: PropTypes.bool,
  VersionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  versions: PropTypes.arrayOf(versionType),
};

HistoryViewerVersionList.defaultProps = {
  extraClass: 'table-hover',
  isActive: false,
  versions: [],
};

export { HistoryViewerVersionList as Component };

export default inject(
  ['HistoryViewerHeading', 'HistoryViewerVersion'],
  (HistoryViewerHeading, HistoryViewerVersion) => ({
    HeadingComponent: HistoryViewerHeading,
    VersionComponent: HistoryViewerVersion,
  }),
  () => 'VersionedAdmin.HistoryViewer.HistoryViewerVersionList'
)(HistoryViewerVersionList);
