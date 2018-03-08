import React, { Component } from 'react';
import HistoryViewerVersionState from 'components/HistoryViewer/HistoryViewerVersionState';

class HistoryViewerVersion extends Component {
  /**
   * Returns the name of the Member who either published the object or last edited it, depending
   * on whether the object is published or not
   *
   * @returns {string}
   */
  getAuthor() {
    const version = this.props.version;
    let member = {
      FirstName: '',
      Surname: '',
    };

    if (version.Published && version.Publisher) {
      member = version.Publisher;
    } else if (version.Author) {
      member = version.Author;
    }

    return `${member.FirstName || ''} ${member.Surname || ''}`;
  }

  render() {
    return (
      <tr>
        <td>{this.props.version.Version}</td>
        <td>
          <HistoryViewerVersionState
            version={this.props.version}
          />
        </td>
        <td>{this.getAuthor()}</td>
      </tr>
    );
  }
}

HistoryViewerVersion.propTypes = {
  version: React.PropTypes.object,
};

HistoryViewerVersion.defaultProps = {
  version: {},
};

export default HistoryViewerVersion;
