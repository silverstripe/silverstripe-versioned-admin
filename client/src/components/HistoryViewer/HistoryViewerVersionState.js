import React, { Component } from 'react';
import classnames from 'classnames';
import i18n from 'i18n';
import moment from 'moment';
import { versionType, defaultVersion } from 'types/versionType';
import { inject } from 'lib/Injector';
import PropTypes from 'prop-types';

class HistoryViewerVersionState extends Component {
  /**
   * Get the HTML classes to apply to the state
   *
   * @returns {string}
   */
  getClassNames() {
    const { extraClass } = this.props;
    return classnames('history-viewer__version-state', extraClass);
  }

  /**
   * Return the type of action that was performed when the record was saved
   *
   * @returns {string} Returns either Saved, Created, Archived, Unpublished or Published
   */
  getPublishedState() {
    const { version } = this.props;

    if (version.version === 1) {
      return i18n._t('HistoryViewer.Created', 'Created');
    }

    if (version.published) {
      if (version.deleted) {
        if (version.draft) {
          return i18n._t('HistoryViewer.Archived', 'Archived');
        }
        return i18n._t('HistoryViewer.Unpublished', 'Unpublished');
      }
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
    return moment(this.props.version.lastEdited).format('L LT');
  }

  /**
   * Return any status badges for the record
   *
   * @returns {ReactElement|string}
   */
  getBadges() {
    const { version, isActive, BadgeComponent } = this.props;

    if (version.liveVersion) {
      return (
        <BadgeComponent
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
      <span className={this.getClassNames()} role="cell">
        {this.getPublishedState()} <small className="text-muted">{this.getDate()}</small>
        {this.getBadges()}
      </span>
    );
  }
}

HistoryViewerVersionState.propTypes = {
  version: versionType,
  extraClass: PropTypes.string,
  isActive: PropTypes.bool,
  BadgeComponent: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired
};

HistoryViewerVersionState.defaultProps = {
  version: defaultVersion,
  extraClass: '',
  isActive: false,
};

export { HistoryViewerVersionState as Component };

export default inject(
  ['Badge'],
  (BadgeComponent) => ({ BadgeComponent }),
  ({ version }) => `HistoryViewer.HistoryViewerVersionState.${version.Version}`
)(HistoryViewerVersionState);
