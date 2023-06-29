import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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

    return classnames(extraClass, {
      table: true,
      'history-viewer__table--headerless': !showHeader,
    });
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

    const isCurrent = currentVersion && currentVersion.version === version.version;
    const isCompareFrom = versionFrom && versionFrom.version === version.version;
    const isCompareTo = versionTo && versionTo.version === version.version;

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
    const { showHeader, HeadingComponent, compareModeAvailable } = this.props;

    if (!showHeader) {
      return null;
    }

    const headingProps = {
      compareModeAvailable,
    };

    return <HeadingComponent {...headingProps} />;
  }

  render() {
    const { VersionComponent, versions, compareModeAvailable, compare } = this.props;

    return (
      <div className="history-viewer__list">
        {this.renderMessages()}
        <ul className={this.getClassNames()} role="table">
          {this.renderHeader()}
          {
            versions.map((version) => (
              <VersionComponent
                key={version.version}
                isActive={this.isVersionActive(version)}
                version={version}
                compare={compare}
                compareModeAvailable={compareModeAvailable}
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
  FormAlertComponent: PropTypes.elementType.isRequired,
  HeadingComponent: PropTypes.elementType.isRequired,
  messages: PropTypes.arrayOf(messageType),
  VersionComponent: PropTypes.elementType.isRequired,
  versions: PropTypes.arrayOf(versionType),
  compare: compareType,
  compareModeAvailable: PropTypes.bool,
};

HistoryViewerVersionList.defaultProps = {
  compareModeAvailable: true,
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
