import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import HistoryViewerVersionState from './HistoryViewerVersionState';
import { versionType, defaultVersion } from 'types/versionType';
import { setCurrentVersion, clearCurrentVersion } from 'state/historyviewer/HistoryViewerActions';

class HistoryViewerVersion extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
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
    const { handleSetCurrentVersion, version } = this.props;
    handleSetCurrentVersion(version.Version);
  }

  render() {
    const { version } = this.props;

    return (
      <tr onClick={this.handleClick}>
        <td>{version.Version}</td>
        <td>
          <HistoryViewerVersionState
            version={version}
          />
        </td>
        <td>{this.getAuthor()}</td>
      </tr>
    );
  }
}

HistoryViewerVersion.propTypes = {
  version: versionType,
};

HistoryViewerVersion.defaultProps = {
  version: defaultVersion,
};

function mapDispatchToProps(dispatch) {
  return {
    handleSetCurrentVersion(id) {
      dispatch(setCurrentVersion(id));
    },
    handleClearCurrentVersion() {
      dispatch(clearCurrentVersion());
    },
  };
}

export default compose(
  connect(() => {}, mapDispatchToProps)
)(HistoryViewerVersion);
