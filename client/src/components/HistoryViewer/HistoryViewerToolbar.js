import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n';
import { inject } from 'lib/Injector';
import backend from 'lib/Backend';
import Config from 'lib/Config';
import getJsonErrorMessage from 'lib/getJsonErrorMessage';
import { addMessage, showList } from 'state/historyviewer/HistoryViewerActions';

const HistoryViewerToolbar = ({
  FormActionComponent,
  ViewModeComponent,
  isLatestVersion = false,
  isPreviewable = false,
  isRevertable = false,
  onAfterRevert,
  recordId,
  versionId,
  recordClass,
  forceDisabled = false,
  showToolbarSuccessMessage = () => {},
  actions,
}) => {
  const [isReverting, setIsReverting] = useState(false);

  /**
   * Triggers a revert action to be performed for the current record's version
   * @returns Promise
   */
  const handleRevert = () => {
    const sectionConfig = Config.getSection('SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController');
    const url = sectionConfig.endpoints.revert;
    setIsReverting(true);
    backend.post(url, {
      id: recordId,
      toVersion: versionId,
      dataClass: recordClass,
    }, {
      'X-SecurityID': Config.get('SecurityID')
    })
      .then(() => {
        showToolbarSuccessMessage(versionId);
        onAfterRevert();
      })
      .catch(async (err) => {
        const message = await getJsonErrorMessage(err);
        actions.toasts.error(message);
      });
  };

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
          onClick={handleRevert}
          icon="back-in-time"
          name="revert"
          attributes={{
            title: revertButtonTitle,
          }}
          data={{
            buttonStyle: 'warning'
          }}
          disabled={isLatestVersion || isReverting || forceDisabled}
          loading={isReverting}
          title={i18n._t('HistoryViewerToolbar.REVERT_TO_VERSION', 'Revert to this version')}
        /> }
        { isPreviewable && <ViewModeComponent id="history-viewer-edit-mode" area="edit" /> }
      </div>
    </div>
  );
};

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
  forceDisabled: PropTypes.bool,
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
