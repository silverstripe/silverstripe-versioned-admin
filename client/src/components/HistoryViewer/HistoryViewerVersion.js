import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { inject } from 'lib/Injector';
import { versionType, defaultVersion } from 'types/versionType';
import { showVersion, setCompareMode, setCompareFrom, setCompareTo } from 'state/historyviewer/HistoryViewerActions';
import i18n from 'i18n';

class HistoryViewerVersion extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCompare = this.handleCompare.bind(this);
  }

  /**
   * Returns the name of the Member who either published the object or last edited it, depending
   * on whether the object is published or not
   *
   * @returns {string}
   */
  getAuthor() {
    const { version } = this.props;
    let member = {};

    if (version.Published && version.Publisher) {
      member = version.Publisher;
    } else if (version.Author) {
      member = version.Author;
    }

    return `${member.FirstName || ''} ${member.Surname || ''}`;
  }

  /**
   * When clicking on a version, render the detail view for it via a Redux action dispatch
   */
  handleClick() {
    const { onSelect, version, isActive, compareMode, compareFrom, onCompareSelect } = this.props;

    // If the clear button is shown, don't do anything when clicking on the row
    if (isActive) {
      return;
    }

    if (compareMode) {
      onCompareSelect(version.Version, !compareFrom);
    } else {
      onSelect(version.Version);
    }
  }

  /**
   * When closing the version, return back to the list view via Redux action dispatch
   */
  handleClose() {
    const { onSelect, compareMode, compareFrom, onCompareSelect, version } = this.props;
    if (compareMode) {
      onCompareSelect(0, version.Version === compareFrom);
    } else {
      onSelect(0);
    }
  }

  /**
   * When the compare mode button is selected, pass the selected version to the Redux store
   */
  handleCompare() {
    const { onCompare, version } = this.props;
    onCompare(version.Version);
  }

  /**
   * Renders a "compare mode" button which will allow the user to start selecting versions to
   * compare differences between. This is usually rendered in the "more actions" menu.
   *
   * @returns {FormAction|null}
   */
  renderCompareButton() {
    const { isActive, showCompareButton, FormActionComponent } = this.props;

    if (!isActive || !showCompareButton) {
      return null;
    }

    return (
      <FormActionComponent
        onClick={this.handleCompare}
        title={i18n._t('HistoryViewerVersion.COMPARE', 'Compare')}
        extraClass="history-viewer__compare-button"
      >
        {i18n._t('HistoryViewerVersion.COMPARE', 'Compare')}
      </FormActionComponent>
    );
  }

  /**
   * Renders a "clear" button to close the version, for example when used in a "detail view"
   * context. This is shown when this version is "active", displayed with a blue background.
   *
   * @returns {FormAction|null}
   */
  renderClearButton() {
    const { FormActionComponent } = this.props;

    return (
      <FormActionComponent
        onClick={this.handleClose}
        icon="cancel"
        title={null}
        extraClass="history-viewer__close-button"
      />
    );
  }

  /**
   * Renders the "actions" menu for the detail view. This menu may contain a compare mode toggle
   * and/or a "clear" button to clear the current selected version
   *
   * @returns {DOMElement}
   */
  renderActions() {
    const { isActive } = this.props;

    if (!isActive) {
      return null;
    }

    return (
      <td className="history-viewer__actions">
        {this.renderCompareButton()}
        {this.renderClearButton()}
      </td>
    );
  }

  render() {
    const { version, isActive, StateComponent } = this.props;

    return (
      <tr onClick={this.handleClick}>
        <td>{version.Version}</td>
        <td>
          <StateComponent
            version={version}
            isActive={isActive}
          />
        </td>
        <td>{this.getAuthor()}</td>
        {this.renderActions()}
      </tr>
    );
  }
}

HistoryViewerVersion.propTypes = {
  isActive: React.PropTypes.bool,
  compareMode: React.PropTypes.bool,
  onSelect: React.PropTypes.func,
  onCompare: React.PropTypes.func,
  onCompareSelect: React.PropTypes.func,
  StateComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  FormActionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  version: versionType,
};

HistoryViewerVersion.defaultProps = {
  isActive: false,
  showCompareButton: true,
  version: defaultVersion,
};

function mapStateToProps(state) {
  return {
    compareMode: state.versionedAdmin.historyViewer.compareMode,
    compareFrom: state.versionedAdmin.historyViewer.compareFrom,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSelect(id) {
      dispatch(showVersion(id));
    },
    onCompare(id) {
        dispatch(setCompareFrom(id));
        dispatch(setCompareMode(true));
    },
    onCompareSelect(versionID, setFrom) {
      if (setFrom) {
        dispatch(setCompareFrom(versionID));
      } else {
        dispatch(setCompareTo(versionID));
      }
    },
  };
}

export { HistoryViewerVersion as Component };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  inject(
    ['HistoryViewerVersionState', 'FormAction'],
    (StateComponent, FormActionComponent) => ({
      StateComponent,
      FormActionComponent,
    }),
    ({ version }) => {
      let context = 'VersionedAdmin.HistoryViewer.HistoryViewerVersion';
      if (version) {
        context += `.${version.Version}`;
      }

      return context;
    }
  )
)(HistoryViewerVersion);
