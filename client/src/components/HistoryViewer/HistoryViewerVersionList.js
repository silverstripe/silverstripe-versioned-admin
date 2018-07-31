import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import i18n from 'i18n';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { inject } from 'lib/Injector';
import { messageType } from 'types/messageType';
import { versionType } from 'types/versionType';
import { compareType } from 'types/compareType';

class HistoryViewerVersionList extends PureComponent {
  /**
   * Return a string of HTML class names for the list element
   *
   * @returns {string}
   */
  getClassNames() {
    const { extraClass, showHeader } = this.props;
    const classes = {
      table: true,
      'history-viewer__table--headerless': !showHeader,
    };
    return classnames(classes, extraClass);
  }

  /**
   * Compares provided version object to see if it is one of the selected ones in the store.
   * It can be that it is either currentVersion, the versionFrom or the versionTo comparison.
   *
   * We receive either a version object, or `false` as props for current/from/to
   * If and only if we are NOT in compare mode:
   * - compare is `false`
   * - versionFrom and versionTo are `undefined`
   * - currentVersion is relevant (otherwise it can be ignored, even if it is a valid version)
   *
   * @see {state/historyviewer/HistoryViewerReducer} for how compare is set
   *
   * Otherwise we simply check to see if the provided version object's version number
   * is equal to one of the version numbers on the store objects.
   *
   * @param {Object} version
   * @returns {boolean}
   */
  isVersionActive(version) {
      const { currentVersion, compare, compare: { versionFrom, versionTo } } = this.props;

      const isCurrent = currentVersion && currentVersion.Version === version.Version;
      const isCompareFrom = versionFrom && versionFrom.Version === version.Version;
      const isCompareTo = versionTo && versionTo.Version === version.Version;

      return (!compare && isCurrent) || isCompareFrom || isCompareTo;
  }

  /**
   * Render any messages into the form
   *
   * @returns {DOMElement}
   */
  renderMessages() {
    const { FormAlertComponent, messages } = this.props;

    if (!messages.length) {
      return null;
    }

    return (
      <div className="history-viewer__messages">
        {
          messages.map((data) => (
            <FormAlertComponent
              key={data.id}
              type={data.type}
              value={data.message}
              closeLabel={i18n._t('HistoryViewerVersionList.CLOSE', 'Close')}
            />
          ))
        }
      </div>
    );
  }

  /**
   * Renders a HeadingComponent at the top of the list, unless it has been disabled.
   * @returns {HistoryViewerHeading|null}
   */
  renderHeader() {
    const { showHeader, HeadingComponent } = this.props;
    return showHeader ? <HeadingComponent /> : null;
  }

  render() {
    const { VersionComponent, versions, compare } = this.props;

    return (
      <div className="history-viewer__list">
        {this.renderMessages()}
        <ul className={this.getClassNames()}>
          {this.renderHeader()}
          {
            versions.map((version) => (
              <VersionComponent
                key={version.Version}
                isActive={this.isVersionActive(version)}
                version={version}
                compare={compare}
              />
            ))
          }
        </ul>
      </div>
    );
  }
}

HistoryViewerVersionList.propTypes = {
  extraClass: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
  showHeader: PropTypes.bool,
  FormAlertComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  HeadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  messages: PropTypes.arrayOf(messageType),
  VersionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  versions: PropTypes.arrayOf(versionType),
  compare: compareType,
};

HistoryViewerVersionList.defaultProps = {
  extraClass: 'history-viewer__table',
  messages: [],
  showHeader: true,
  versions: [],
};

function mapStateToProps(state) {
  const { messages, compare, currentVersion } = state.versionedAdmin.historyViewer;
  return {
    messages,
    compare,
    currentVersion,
  };
}

export { HistoryViewerVersionList as Component };

export default compose(
  connect(mapStateToProps),
  inject(
    ['FormAlert', 'HistoryViewerHeading', 'HistoryViewerVersion'],
    (FormAlert, HistoryViewerHeading, HistoryViewerVersion) => ({
      FormAlertComponent: FormAlert,
      HeadingComponent: HistoryViewerHeading,
      VersionComponent: HistoryViewerVersion,
    }),
    () => 'VersionedAdmin.HistoryViewer.HistoryViewerVersionList'
  )
)(HistoryViewerVersionList);
