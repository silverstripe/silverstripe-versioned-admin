import React, { Component } from 'react';
import HistoryViewerVersionState from 'components/HistoryViewer/HistoryViewerVersionState';
import { versionType, defaultVersion } from 'types/versionType';

class HistoryViewerVersion extends Component {
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

  render() {
    const { version } = this.props;
    return (
      <tr>
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

export default HistoryViewerVersion;
