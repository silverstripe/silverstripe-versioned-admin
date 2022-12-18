import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { inject } from 'lib/Injector';
import { versionType, defaultVersion } from 'types/versionType';
import { compareType } from 'types/compareType';
import i18n from 'i18n';
import classNames from 'classnames';
import {
  showVersion,
  clearMessages,
  setCompareMode,
  setCompareFrom,
  setCompareTo,
} from 'state/historyviewer/HistoryViewerActions';

class HistoryViewerVersion extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCompare = this.handleCompare.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
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

    if (version.published && version.publisher) {
      member = version.publisher;
    } else if (version.author) {
      member = version.author;
    }

    return `${member.firstName || ''} ${member.surname || ''}`;
  }

  /**
   * Return a string of HTML class names for the row (list item) element
   *
   * @returns {string}
   */
  getClassNames() {
    const { extraClass, isActive, compare, compare: { compareFrom, compareTo } } = this.props;
    const defaultClasses = {
      'history-viewer__row': true,
      'history-viewer__row--current': isActive,
      'history-viewer__row--comparison-selected': compare && !(compareFrom && compareTo),
    };
    return classNames(defaultClasses, extraClass);
  }

  /**
   * If pressing enter key, trigger click event to load detail view
   *
   * @param {Object} event
   */
  handleKeyUp(event) {
    if (event.keyCode === 13) {
      this.handleClick();
    }
  }

  /**
   * When clicking on a version, render the detail view for it via a Redux action dispatch
   * passed through via a closure prop (onSelect)
   */
  handleClick() {
    const { onSelect, version, isActive, compare } = this.props;

    // If the clear button is shown, don't do anything when clicking on the row
    if (isActive) {
      return false;
    }

    onSelect(version, compare);
    return false;
  }

  handleCompare() {
    const { onCompareMode, version } = this.props;
    onCompareMode(version);
  }

  /**
   * When closing the version, return back to the list view via Redux action dispatch
   */
  handleClose() {
    const { onSelect, version, compare, compare: { versionFrom } } = this.props;
    if (versionFrom && versionFrom.version === version.version) {
      // Ensures we set the correct thing. C.f. logic in mapDispatchToProps -> onSelect
      delete compare.versionFrom;
    }
    onSelect(0, compare);
  }

  /**
   * Renders a "compare mode" button which will allow the user to start selecting versions to
   * compare differences between. This is usually rendered in the "more actions" menu.
   *
   * @returns {FormAction|null}
   */
  renderCompareButton() {
    const { compareModeAvailable, compare, FormActionComponent } = this.props;
    const translatedText = i18n._t('HistoryViewerVersion.COMPARE', 'Compare');

    if (!compareModeAvailable || compare) {
      return null;
    }

    return (
      <FormActionComponent
        onClick={this.handleCompare}
        title={translatedText}
        buttonStyle="outline-light"
        extraClass="history-viewer__compare-button"
      >
        {translatedText}
      </FormActionComponent>
    );
  }

  /**
   * Renders a "clear" button to close the version, for example when used in a "detail view"
   * context. This is shown when this version is "active", displayed with a blue background.
   * It is hidden for the selected version when compare mode is active, until the row is hovered or
   * focused.
   *
   * @returns {FormAction|null}
   */
  renderClearButton() {
    const { FormActionComponent, isActive } = this.props;

    if (!isActive) {
      return null;
    }

    return (
      <FormActionComponent
        onClick={this.handleClose}
        icon="cancel"
        // Provide the title as an attribute to prevent it from rendering as text on the button
        attributes={{
          title: i18n._t('HistoryViewerVersion.CLOSE', 'Close'),
        }}
        title={null}
        buttonStyle="outline-light"
        extraClass="history-viewer__close-button"
      />
    );
  }

  /**
   * Renders an "Already selected" span to close the selected version when compare mode is enabled.
   * Hidden in all other cases in favour of the "clear button". When the rendered version is
   * hovered or focused, it gets hidden and the clear button is rendered instead.
   *
   * @returns {DOMElement|null}
   */
  renderSelectedMessage() {
    const { isActive } = this.props;

    if (!isActive) {
      return null;
    }

    return (
      <span className="history-viewer__selected-message">
        {i18n._t('HistoryViewerVersion.SELECTED', 'Already selected')}
      </span>
    );
  }

  /**
   * Renders the "actions" menu for the detail view. This menu may contain a compare mode toggle
   * and/or a "clear" button to clear the current selected version
   *
   * @returns {DOMElement}
   */
  renderActions() {
    const { isActive, compare } = this.props;

    if (!isActive && !compare) {
      return (
        <span className="history-viewer__actions" role="cell" />
      );
    }

    return (
      <span className="history-viewer__actions" role="cell">
        {this.renderCompareButton()}
        {this.renderSelectedMessage()}
        {this.renderClearButton()}
      </span>
    );
  }

  render() {
    const { version, isActive, StateComponent } = this.props;

    const rowTitle = i18n._t('HistoryViewerVersion.GO_TO_VERSION', 'Go to version {version}');

    return (
      <li className={this.getClassNames()} role="row">
        <span
          className="history-viewer__version-link"
          role="button"
          title={i18n.inject(rowTitle, { version: version.Version })}
          onClick={this.handleClick}
          onKeyUp={this.handleKeyUp}
          tabIndex={0}
        >
          <span className="history-viewer__version-no" role="cell">
            {version.version}
          </span>
          <StateComponent
            version={version}
            isActive={isActive}
          />
          <span className="history-viewer__author" role="cell">
            {this.getAuthor()}
          </span>
          {this.renderActions()}
        </span>
      </li>
    );
  }
}

HistoryViewerVersion.propTypes = {
  extraClass: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
  version: versionType,
  isActive: PropTypes.bool,
  onSelect: PropTypes.func,
  onCompareMode: PropTypes.func,
  compare: compareType,
  compareModeAvailable: PropTypes.bool,
  StateComponent: PropTypes.elementType.isRequired,
  FormActionComponent: PropTypes.elementType.isRequired,
};

HistoryViewerVersion.defaultProps = {
  isActive: false,
  version: defaultVersion,
  compare: false,
  compareModeAvailable: true,
};

export { HistoryViewerVersion as Component };

function mapDispatchToProps(dispatch) {
  return {
    onSelect(selectedVersion, compare) {
      const { versionFrom } = compare;
      if (compare) {
        if (!versionFrom) {
          dispatch(setCompareFrom(selectedVersion));
        } else {
          dispatch(setCompareTo(selectedVersion));
        }
      } else {
        dispatch(showVersion(selectedVersion));
        dispatch(clearMessages());
      }
    },
    onCompareMode(version) {
      dispatch(setCompareFrom(version));
      dispatch(setCompareMode(true));
    }
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  inject(
    ['HistoryViewerVersionState', 'FormAction'],
    (StateComponent, FormActionComponent) => ({
      StateComponent,
      FormActionComponent,
    }),
    ({ version }) => {
      let context = 'VersionedAdmin.HistoryViewer.HistoryViewerVersion';
      if (version) {
        context += `.${version.version}`;
      }
      return context;
    }
  )
)(HistoryViewerVersion);
