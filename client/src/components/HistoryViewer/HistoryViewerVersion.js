import React, { Component, PropTypes } from 'react';
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
    if (versionFrom && versionFrom.Version === version.Version) {
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
    const { compare, FormActionComponent } = this.props;
    const translatedText = i18n._t('HistoryViewerVersion.COMPARE', 'Compare');

    if (compare) {
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
        title={null}
        buttonStyle="outline-light"
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
    const { isActive, compare } = this.props;

    if (!isActive && !compare) {
      return (
        <span className="history-viewer__actions" />
      );
    }

    return (
      <span className="history-viewer__actions">
        {this.renderCompareButton()}
        {this.renderClearButton()}
      </span>
    );
  }

  render() {
    const { version, isActive, StateComponent } = this.props;

    const rowTitle = i18n._t('HistoryViewerVersion.GO_TO_VERSION', 'Go to version {version}');

    return (
      <li className={this.getClassNames()}>
        <a
          href={null}
          className="history-viewer__version-anchor"
          title={i18n.inject(rowTitle, { version: version.Version })}
          onClick={this.handleClick}
        >
          <span className="history-viewer__version-no">{version.Version}</span>
          <StateComponent
            version={version}
            isActive={isActive}
          />
          <span className="history-viewer__author">{this.getAuthor()}</span>
          {this.renderActions()}
        </a>
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
  StateComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  FormActionComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

HistoryViewerVersion.defaultProps = {
  isActive: false,
  version: defaultVersion,
  compare: false,
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
        context += `.${version.Version}`;
      }
      return context;
    }
  )
)(HistoryViewerVersion);
