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
   * Return a string of HTML class names for the table element
   *
   * @returns {string}
   */
  getClassNames() {
    const { extraClass } = this.props;
    return classnames({ table: true }, extraClass);
  }

  /**
   * "isActive" in this component indicates that the content is shown - ie. the table
   * only shows the row (or rows) that are currently highlighted above the content of
   * this version.
   *
   * @param {Object} version
   * @returns {boolean}
   */
  isVersionActive(version) {
    const { isActive, compare } = this.props;
    if (isActive) {
      return true;
    }

    return version.Version === compare.versionFrom || version.Version === compare.versionTo;
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

  render() {
    const { HeadingComponent, VersionComponent, versions } = this.props;

    return (
      <div className="history-viewer__list">
        {this.renderMessages()}

        <ul className={this.getClassNames()}>
          <HeadingComponent />
          {
            versions.map((version) => (
              <VersionComponent
                key={version.Version}
                isActive={this.isVersionActive(version)}
                version={version}
              />
            ))
          }
        </ul>
      </div>
    );
  }
}

HistoryViewerVersionList.propTypes = {
  extraClass: PropTypes.string,
  FormAlertComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  HeadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  isActive: PropTypes.bool,
  messages: PropTypes.arrayOf(messageType),
  VersionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  versions: PropTypes.arrayOf(versionType),
  compare: compareType
};

HistoryViewerVersionList.defaultProps = {
  extraClass: 'history-viewer__table',
  isActive: false,
  messages: [],
  versions: [],
};

function mapStateToProps(state) {
  const { messages, compare } = state.versionedAdmin.historyViewer;
  return {
    messages,
    compare
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
