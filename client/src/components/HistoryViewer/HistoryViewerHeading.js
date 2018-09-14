import i18n from 'i18n';
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { setCompareMode } from 'state/historyviewer/HistoryViewerActions';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class HistoryViewerHeading extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.handleCompareModeChange = this.handleCompareModeChange.bind(this);

    this.state = {
      dropdownOpen: false,
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  handleCompareModeChange() {
    const { compareModeSelected, onCompareModeUnselect, onCompareModeSelect } = this.props;
    if (compareModeSelected) {
      onCompareModeUnselect();
    } else {
      onCompareModeSelect();
    }
  }

  /**
   * If compare mode is available, renders a dropdown containing the "compare two versions" option
   *
   * @returns {Dropdown|null}
   */
  renderDropdown() {
    const { compareModeAvailable, compareModeSelected } = this.props;
    const { dropdownOpen } = this.state;

    if (!compareModeAvailable) {
      return null;
    }

    return (
      <Dropdown
        isOpen={dropdownOpen}
        toggle={this.toggle}
        className="history-viewer__actions-dropdown"
      >
        <DropdownToggle className="font-icon-sliders" />
        <DropdownMenu right>
          <div className="form-check">
            <input
              id="history-viewer-compare-two"
              type="checkbox"
              className="no-change-track history-viewer-heading__compare-mode-checkbox"
              checked={compareModeSelected}
              onChange={this.handleCompareModeChange}
            />
            <label className="form-check-label" htmlFor="history-viewer-compare-two">
              {i18n._t('HistoryViewerHeading.COMPARE_VERSIONS', 'Compare two versions')}
            </label>
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  }

  render() {
    return (
      <li className="history-viewer__heading" role="row">
        <span className="history-viewer__version-no" role="columnheader">#</span>
        <span className="history-viewer__version-state" role="columnheader">
          {i18n._t('HistoryViewer.Record', 'Record')}
        </span>
        <span className="history-viewer__author" role="columnheader">
          {i18n._t('HistoryViewer.Author', 'Author')}
        </span>
        <span className="history-viewer__actions" role="columnheader">
          {this.renderDropdown()}
        </span>
      </li>
    );
  }
}

HistoryViewerHeading.propTypes = {
  compareModeAvailable: PropTypes.bool,
  compareModeSelected: PropTypes.bool,
  onCompareModeSelect: PropTypes.func,
  onCompareModeUnselect: PropTypes.func,
};

HistoryViewerHeading.defaultProps = {
  compareModeAvailable: true,
};

function mapStateToProps(state) {
  return {
    compareModeSelected: !!state.versionedAdmin.historyViewer.compare,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onCompareModeSelect() {
      dispatch(setCompareMode(true));
    },
    onCompareModeUnselect() {
      dispatch(setCompareMode(false));
    },
  };
}

export { HistoryViewerHeading as Component };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(HistoryViewerHeading);
