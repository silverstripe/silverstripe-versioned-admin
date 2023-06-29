import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n';
import { inject } from 'lib/Injector';
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
    const { actions: { revertToVersion }, onAfterRevert, recordId, versionId } = this.props;

    this.setState({ isReverting: true });

    const handler = typeof onAfterRevert === 'function' ? onAfterRevert : () => {};
    return revertToVersion(recordId, versionId, 'DRAFT', 'DRAFT').then(() => handler(versionId));
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
};

HistoryViewerToolbar.defaultProps = {
  isLatestVersion: false,
  isPreviewable: false,
  isRevertable: false,
};

function mapDispatchToProps(dispatch) {
  return {
    onAfterRevert(versionId) {
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
