import i18n from 'i18n';
import React, { Component } from 'react';
import moment from 'moment';
import Badge from 'components/Badge/Badge';
import { versionType, defaultVersion } from 'types/versionType';

class HistoryViewerVersionState extends Component {
  /**
   * Get the HTML classes to apply to the state
   *
   * @returns {string}
   */
  getClassNames() {
    return `${this.props.extraClass} history-viewer__version-state`;
  }

  /**
   * When the record is published, return "Published", else return "Saved"
   *
   * @returns {string}
   */
  getPublishedState() {
    if (this.props.version.Published) {
      return i18n._t('HistoryViewer.Published', 'Published');
    }

    return i18n._t('HistoryViewer.Saved', 'Saved');
  }

  /**
   * Formats the last edited date according to the current locale and return it in the example
   * format "03/01/2018 2:45 PM"
   *
   * @returns {string}
   */
  getDate() {
    moment.locale(i18n.detectLocale());
    return moment(this.props.version.LastEdited).format('L LT');
  }

  /**
   * Return any status badges for the record
   *
   * @returns {ReactElement|string}
   */
  getBadges() {
    const { version, isActive } = this.props;

    if (version.LiveVersion) {
      return (
        <Badge
          status="success"
          message={i18n._t('HistoryViewer.BadgeLive', 'Live')}
          className="" // removes the default pill styles
          inverted={isActive}
        />
      );
    }

    return '';
  }

  render() {
    return (
      <span className={this.getClassNames()}>
        {this.getPublishedState()} <small className="text-muted">{this.getDate()}</small>
        {this.getBadges()}
      </span>
    );
  }
}

HistoryViewerVersionState.propTypes = {
  version: versionType,
  extraClass: React.PropTypes.string,
  isActive: React.PropTypes.bool,
};

HistoryViewerVersionState.defaultProps = {
  version: defaultVersion,
  extraClass: '',
  isActive: false,
};

export default HistoryViewerVersionState;
