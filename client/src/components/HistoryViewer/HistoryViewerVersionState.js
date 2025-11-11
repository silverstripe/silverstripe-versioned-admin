import React from 'react';
import classnames from 'classnames';
import i18n from 'i18n';
import moment from 'moment';
import { versionType, defaultVersion } from 'types/versionType';
import { inject } from 'lib/Injector';
import PropTypes from 'prop-types';

const HistoryViewerVersionState = ({
  version = defaultVersion,
  extraClass = '',
  isActive = false,
  BadgeComponent,
}) => {
  /**
   * Get the HTML classes to apply to the state
   *
   * @returns {string}
   */
  const getClassNames = () => classnames('history-viewer__version-state', extraClass);

  /**
   * Return the type of action that was performed when the record was saved
   *
   * @returns {string} Returns either Saved, Created, Archived, Unpublished or Published
   */
  const getPublishedState = () => {
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
  };

  /**
   * Formats the last edited date according to the current locale and return it in the example
   * format "03/01/2018 2:45 PM"
   *
   * @returns {string}
   */
  const getDate = () => {
    moment.locale(i18n.detectLocale());
    return moment(version.lastEdited).format('L LT');
  };

  /**
   * Return any status badges for the record
   *
   * @returns {ReactElement|string}
   */
  const getBadges = () => {
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
  };

  return (
    <span className={getClassNames()} role="cell">
      {getPublishedState()} <small className="text-muted">{getDate()}</small>
      {getBadges()}
    </span>
  );
};

HistoryViewerVersionState.propTypes = {
  version: versionType,
  extraClass: PropTypes.string,
  isActive: PropTypes.bool,
  BadgeComponent: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired
};

export { HistoryViewerVersionState as Component };

export default inject(
  ['Badge'],
  (BadgeComponent) => ({ BadgeComponent }),
  ({ version }) => `HistoryViewer.HistoryViewerVersionState.${version.Version}`
)(HistoryViewerVersionState);
