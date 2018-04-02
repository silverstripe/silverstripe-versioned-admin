import React, { Component } from 'react';
import HistoryViewerVersionState from './HistoryViewerVersionState';
import { versionType, defaultVersion } from 'types/versionType';
import FormAction from 'components/FormAction/FormAction';

class HistoryViewerVersion extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
   * Return a "clear" button to close the version, for example when used in a "detail view"
   * context. This is shown when this version is "active", displayed with a blue background.
   *
   * @returns {FormAction|null}
   */
  getClearButton() {
    const { isActive } = this.props;
    if (!isActive) {
      return null;
    }

    return (
      <td className="history-viewer__actions">
        <FormAction
          onClick={this.handleClose}
          icon="cancel"
          title={null}
          extraClass="history-viewer__close-button"
        />
      </td>
    );
  }

  /**
   * When clicking on a version, render the detail view for it via a Redux action dispatch
   */
  handleClick() {
    const { handleSetCurrentVersion, version, isActive } = this.props;

    // If the clear button is shown, don't do anything when clicking on the row
    if (isActive) {
      return;
    }

    handleSetCurrentVersion(version.Version);
  }

  /**
   * When closing the version, return back to the list view via Redux action dispatch
   */
  handleClose() {
    const { handleSetCurrentVersion } = this.props;
    handleSetCurrentVersion(0);
  }

  render() {
    const { version, isActive } = this.props;

    return (
      <tr onClick={this.handleClick}>
        <td>{version.Version}</td>
        <td>
          <HistoryViewerVersionState
            version={version}
            isActive={isActive}
          />
        </td>
        <td>{this.getAuthor()}</td>
        { this.getClearButton() }
      </tr>
    );
  }
}

HistoryViewerVersion.propTypes = {
  isActive: React.PropTypes.bool,
  handleSetCurrentVersion: React.PropTypes.func,
  version: versionType,
};

HistoryViewerVersion.defaultProps = {
  isActive: false,
  version: defaultVersion,
};

export default HistoryViewerVersion;
