import i18n from 'i18n';
import React, { useState, useRef } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { setCompareMode } from 'state/historyviewer/HistoryViewerActions';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const HistoryViewerHeading = ({
  compareModeAvailable = true,
  compareModeSelected,
  onCompareModeUnselect,
  onCompareModeSelect,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const checkboxRef = useRef(null);

  const toggle = () => {
    // If we are opening the dropdown, force focus onto the checkbox.
    const shouldOpen = !dropdownOpen;
    if (shouldOpen && checkboxRef.current) {
      // setTimeout() is used to wait for the DOM to update after the state change.
      setTimeout(() => checkboxRef.current.focus(), 0);
    }
    setDropdownOpen(shouldOpen);
  };

  const handleKeyDown = (event) => {
    // Close the dropdown on Escape keypress when focused inside the dropdown menu
    if (event.key === 'Escape') {
      event.preventDefault();
      toggle();
    }
  };

  const handleCompareModeChange = () => {
    if (compareModeSelected) {
      onCompareModeUnselect();
    } else {
      onCompareModeSelect();
    }
  };

  /**
   * If compare mode is available, renders a dropdown containing the "compare two versions" option
   *
   * @returns {Dropdown|null}
   */
  const renderDropdown = () => {
    if (!compareModeAvailable) {
      return null;
    }
    const dropdownLabel = i18n._t('HistoryViewer.COMPARE_MODE', 'Compare mode');
    return (
      <Dropdown
        isOpen={dropdownOpen}
        toggle={toggle}
        className="history-viewer__actions-dropdown"
      >
        <DropdownToggle className="btn--no-text" title={dropdownLabel} aria-label={dropdownLabel}>
          <span className="font-icon-sliders" aria-hidden="true" />
        </DropdownToggle>
        <DropdownMenu end>
          <div className="form-check">
            <input
              id="history-viewer-compare-two"
              type="checkbox"
              className="no-change-track history-viewer-heading__compare-mode-checkbox"
              checked={compareModeSelected}
              onChange={handleCompareModeChange}
              onKeyDown={handleKeyDown}
              ref={checkboxRef}
            />
            <label className="form-label form-check-label" htmlFor="history-viewer-compare-two">
              {i18n._t('HistoryViewerHeading.COMPARE_VERSIONS', 'Compare two versions')}
            </label>
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  };

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
        {renderDropdown()}
      </span>
    </li>
  );
};

HistoryViewerHeading.propTypes = {
  compareModeAvailable: PropTypes.bool,
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
