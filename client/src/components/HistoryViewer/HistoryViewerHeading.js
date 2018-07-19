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
    }
    else {
      onCompareModeSelect();
    }
  }

  render() {
    const { compareModeSelected, hasActions } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <tr className="history-viewer__heading">
        <th>#</th>
        <th>{i18n._t('HistoryViewer.Record', 'Record')}</th>
        <th className="author-compare-toggle__container">
          <span className="author-span">{i18n._t('HistoryViewer.Author', 'Author')}</span>
          <Dropdown
            isOpen={dropdownOpen}
            toggle={this.toggle}
            className="compare-dropdown"
          >
            <DropdownToggle className="font-icon-sliders" />
            <DropdownMenu right>
              <div className="form-check">
                <input
                  id="history-viewer-compare-two"
                  type="checkbox"
                  className="no-change-track compare-mode__checkbox"
                  checked={compareModeSelected}
                  onChange={this.handleCompareModeChange}
                />
                <label className="form-check-label" htmlFor="history-viewer-compare-two">
                  {i18n._t('HistoryViewerHeading.COMPARE_VERSIONS', 'Compare two versions')}
                </label>
              </div>
            </DropdownMenu>
          </Dropdown>
        </th>
        {hasActions ? <th /> : null}
      </tr>
    );
  }
}

HistoryViewerHeading.propTypes = {
  hasActions: React.PropTypes.bool,
  compareModeSelected: React.PropTypes.bool,
  onCompareModeSelect: React.PropTypes.func,
  onCompareModeUnselect: React.PropTypes.func,
};

HistoryViewerHeading.defaultProps = {
  hasActions: false,
};

function mapStateToProps(state) {
  return {
    compareModeSelected: state.versionedAdmin.historyViewer.compareMode,
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
