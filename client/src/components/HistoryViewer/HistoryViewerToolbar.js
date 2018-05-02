import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n';
import { inject } from 'lib/Injector';
import { addMessage, setCurrentPage, setCurrentVersion } from 'state/historyviewer/HistoryViewerActions';

class HistoryViewerToolbar extends Component {
  constructor(props) {
    super(props);

    this.handleRevert = this.handleRevert.bind(this);
  }

  /**
   * Triggers a revert action to be performed for the current record's version
   */
  handleRevert() {
    const { actions: { revertToVersion }, onAfterRevert, recordId, versionId } = this.props;

    revertToVersion(recordId, versionId, 'DRAFT', 'DRAFT');

    onAfterRevert(versionId);
  }

  render() {
    const { FormActionComponent } = this.props;

    return (
      <div className="toolbar toolbar--south">
        <div className="btn-toolbar">
          <FormActionComponent
            onClick={this.handleRevert}
            icon="back-in-time"
            name="revert"
            data={{ buttonStyle: 'warning' }}
            title={i18n._t('HistoryViewerVersionDetail.REVERT_TO_VERSION', 'Revert to this version')}
          />
        </div>
      </div>
    );
  }
}

HistoryViewerToolbar.propTypes = {
  actions: PropTypes.shape({
    revertToVersion: PropTypes.func.isRequired,
  }),
  onAfterRevert: PropTypes.func.isRequired,
  recordId: PropTypes.number.isRequired,
  versionId: PropTypes.number.isRequired,
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

      // Send user back to the list view, on the first page
      dispatch(setCurrentPage(0));
      dispatch(setCurrentVersion(0));
    },
  };
}

export { HistoryViewerToolbar as Component };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  inject(
    ['FormAction'],
    (FormActionComponent) => ({
      FormActionComponent,
    }),
    () => 'VersionedAdmin.HistoryViewer.Toolbar'
  )
)(HistoryViewerToolbar);
