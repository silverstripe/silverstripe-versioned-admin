import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n';
import { inject } from 'lib/Injector';
import backend from 'lib/Backend';
import Config from 'lib/Config';
import getJsonErrorMessage from 'lib/getJsonErrorMessage';
import { addMessage, showList } from 'state/historyviewer/HistoryViewerActions';

class HistoryViewerToolbar extends Component {
  constructor(props) {
    super(props);

    this.handleRevert = this.handleRevert.bind(this);

    this.state = {
      isReverting: false,
    };
  }

  /**
   * Triggers a revert action to be performed for the current record's version
   * @returns Promise
   */
  handleRevert() {
    const { onAfterRevert, recordId, versionId, recordClass } = this.props;
    const sectionConfig = Config.getSection('SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController');
    const url = sectionConfig.endpoints.revert;
    this.setState({
      isReverting: true,
    });
    backend.post(url, {
      id: recordId,
      toVersion: versionId,
      dataClass: recordClass,
    }, {
      'X-SecurityID': Config.get('SecurityID')
    })
      .then(() => {
        this.props.showToolbarSuccessMessage(versionId);
        onAfterRevert();
      })
      .catch(async (err) => {
        const message = await getJsonErrorMessage(err);
        this.props.actions.toasts.error(message);
      });
  }

  render() {
    const {
      FormActionComponent,
      ViewModeComponent,
      isLatestVersion,
      isPreviewable,
      isRevertable
    } = this.props;
    const { isReverting } = this.state;

    let revertButtonTitle = '';
    if (isReverting) {
      revertButtonTitle = i18n._t('HistoryViewerToolbar.REVERT_IN_PROGRESS', 'Revert in progress...');
    } else if (isLatestVersion) {
      revertButtonTitle = i18n._t('HistoryViewerToolbar.REVERT_UNAVAILABLE', 'Unavailable for the current version');
    }

    return (
      <div className="toolbar toolbar--south">
        <div className="btn-toolbar">
          { isRevertable && <FormActionComponent
            onClick={this.handleRevert}
            icon="back-in-time"
            name="revert"
            attributes={{
              title: revertButtonTitle,
            }}
            data={{
              buttonStyle: 'warning'
            }}
            disabled={isLatestVersion || isReverting}
            loading={isReverting}
            title={i18n._t('HistoryViewerToolbar.REVERT_TO_VERSION', 'Revert to this version')}
          /> }
          { isPreviewable && <ViewModeComponent id="history-viewer-edit-mode" area="edit" /> }
        </div>
      </div>
    );
  }
}

HistoryViewerToolbar.propTypes = {
  actions: PropTypes.shape({
    revertToVersion: PropTypes.func.isRequired,
  }),
  FormActionComponent: PropTypes.elementType.isRequired,
  ViewModeComponent: PropTypes.elementType.isRequired,
  isLatestVersion: PropTypes.bool,
  isPreviewable: PropTypes.bool,
  isRevertable: PropTypes.bool,
  onAfterRevert: PropTypes.func,
  recordId: PropTypes.number.isRequired,
  versionId: PropTypes.number.isRequired,
  recordClass: PropTypes.string.isRequired,
};

HistoryViewerToolbar.defaultProps = {
  isLatestVersion: false,
  isPreviewable: false,
  isRevertable: false,
  showToolbarSuccessMessage: () => {},
};

function mapDispatchToProps(dispatch) {
  return {
    showToolbarSuccessMessage(versionId) {
      dispatch(addMessage(
        i18n.sprintf(
          i18n._t('HistoryViewerToolbar.REVERTED_MESSAGE', 'Successfully reverted to version %s'),
          versionId
        )
      ));
      dispatch(showList());
    },
  };
}

export { HistoryViewerToolbar as Component };

export default compose(
  connect(null, mapDispatchToProps),
  inject(
    ['FormAction', 'ViewModeToggle'],
    (FormActionComponent, ViewModeComponent) => ({
      FormActionComponent,
      ViewModeComponent,
    }),
    () => 'VersionedAdmin.HistoryViewer.Toolbar'
  )
)(HistoryViewerToolbar);
