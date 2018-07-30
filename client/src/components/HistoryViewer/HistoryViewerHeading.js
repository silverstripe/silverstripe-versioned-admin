import i18n from 'i18n';
import React, { PropTypes, Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { setCompareMode } from 'state/historyviewer/HistoryViewerActions';
import { compose } from 'redux';
import { connect } from 'react-redux';

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

  render() {
    const { compareModeSelected } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <li className="history-viewer__heading">
        <span className="history-viewer__version-no">#</span>
        <span className="history-viewer__version-state">
          {i18n._t('HistoryViewer.Record', 'Record')}
        </span>
        <span className="history-viewer__author">
          {i18n._t('HistoryViewer.Author', 'Author')}
        </span>
        <span className="history-viewer__actions">
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
        </span>
      </li>
    );
  }
}

HistoryViewerHeading.propTypes = {
  compareModeSelected: PropTypes.bool,
  onCompareModeSelect: PropTypes.func,
  onCompareModeUnselect: PropTypes.func,
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
