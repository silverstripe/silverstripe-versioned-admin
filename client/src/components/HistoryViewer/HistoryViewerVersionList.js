import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import FormAlert from 'components/FormAlert/FormAlert';
import i18n from 'i18n';
import { clearMessages } from 'state/historyviewer/HistoryViewerActions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { inject } from 'lib/Injector';
import { messageType } from 'types/messageType';
import { versionType } from 'types/versionType';

class HistoryViewerVersionList extends PureComponent {
  /**
   * Clear any messages so they aren't re-rendered again later. This is controlled by a
   * boolean property, since the list is also used in the detail context where we don't
   * want to clear messages from.
   */
  componentWillUnmount() {
    const { onClearMessages, shouldClearMessages } = this.props;

    if (shouldClearMessages) {
      onClearMessages();
    }
  }

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
   * Render any messages into the form
   *
   * @returns {DOMElement}
   */
  renderMessages() {
    const { messages } = this.props;

    if (!messages.length) {
      return null;
    }

    return (
      <div className="history-viewer__messages">
        {
          messages.map((data, key) => (
            <FormAlert
              // eslint-disable-next-line react/no-array-index-key
              key={key}
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
    const { HeadingComponent, isActive, VersionComponent, versions } = this.props;

    return (
      <div>
        {this.renderMessages()}

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
      </div>
    );
  }
}

HistoryViewerVersionList.propTypes = {
  extraClass: PropTypes.string,
  HeadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  isActive: PropTypes.bool,
  messages: PropTypes.arrayOf(messageType),
  onClearMessages: PropTypes.func,
  shouldClearMessages: PropTypes.bool,
  VersionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  versions: PropTypes.arrayOf(versionType),
};

HistoryViewerVersionList.defaultProps = {
  extraClass: 'table-hover',
  isActive: false,
  messages: [],
  shouldClearMessages: true,
  versions: [],
};

function mapStateToProps(state) {
  const { messages } = state.versionedAdmin.historyViewer;
  return {
    messages,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onClearMessages() {
      dispatch(clearMessages());
    }
  };
}

export { HistoryViewerVersionList as Component };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  inject(
    ['HistoryViewerHeading', 'HistoryViewerVersion'],
    (HistoryViewerHeading, HistoryViewerVersion) => ({
      HeadingComponent: HistoryViewerHeading,
      VersionComponent: HistoryViewerVersion,
    }),
    () => 'VersionedAdmin.HistoryViewer.HistoryViewerVersionList'
  )
)(HistoryViewerVersionList);
