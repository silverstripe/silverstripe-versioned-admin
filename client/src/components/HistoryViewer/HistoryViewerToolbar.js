import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n';
import { inject } from 'lib/Injector';
import { addMessage, showList } from 'state/historyviewer/HistoryViewerActions';

class HistoryViewerToolbar extends Component {
  constructor(props) {
    super(props);

    this.handleRevert = this.handleRevert.bind(this);
  }

  /**
   * Triggers a revert action to be performed for the current record's version
   * @returns Promise
   */
  handleRevert() {
    const { actions: { revertToVersion }, onAfterRevert, recordId, versionId } = this.props;

    const handler = typeof onAfterRevert === 'function' ? onAfterRevert : () => {};
    return revertToVersion(recordId, versionId, 'DRAFT', 'DRAFT').then(handler(versionId));
  }

  render() {
    const { FormActionComponent, ViewModeComponent, isLatestVersion, isPreviewable } = this.props;

    return (
      <div className="toolbar toolbar--south">
        <div className="btn-toolbar">
          <FormActionComponent
            onClick={this.handleRevert}
            icon="back-in-time"
            name="revert"
            attributes={{
              title: i18n._t('HistoryViewerToolbar.REVERT_UNAVAILABLE', 'Unavailable for the current version'),
            }}
            data={{
              buttonStyle: 'warning'
            }}
            disabled={isLatestVersion}
            title={i18n._t('HistoryViewerToolbar.REVERT_TO_VERSION', 'Revert to this version')}
          />
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
  FormActionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  ViewModeComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  isLatestVersion: PropTypes.bool,
  isPreviewable: PropTypes.bool,
  onAfterRevert: PropTypes.func,
  recordId: PropTypes.number.isRequired,
  versionId: PropTypes.number.isRequired,
};

HistoryViewerToolbar.defaultProps = {
  isLatestVersion: false,
  isPreviewable: false,
};

function mapStateToProps() {
  return {};
}

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
  connect(mapStateToProps, mapDispatchToProps),
  inject(
    ['FormAction', 'ViewModeToggle'],
    (FormActionComponent, ViewModeComponent) => ({
      FormActionComponent,
      ViewModeComponent,
    }),
    () => 'VersionedAdmin.HistoryViewer.Toolbar'
  )
)(HistoryViewerToolbar);
