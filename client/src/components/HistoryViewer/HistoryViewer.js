/* global window */

import React, { useState, useEffect } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Paginator from 'components/Paginator/Paginator';
import historyViewerConfig from 'containers/HistoryViewer/HistoryViewerConfig';
import { inject } from 'lib/Injector';
import backend from 'lib/Backend';
import Config from 'lib/Config';
import getJsonErrorMessage from 'lib/getJsonErrorMessage';
import Loading from 'components/Loading/Loading';
import {
  setCurrentPage,
  showVersion,
  clearMessages,
} from 'state/historyviewer/HistoryViewerActions';
import { versionType } from 'types/versionType';
import { compareType } from 'types/compareType';
import classNames from 'classnames';
import ResizeAware from 'components/ResizeAware/ResizeAware';
import * as viewModeActions from 'state/viewMode/ViewModeActions';
import * as toastsActions from 'state/toasts/ToastsActions';
import PropTypes from 'prop-types';
import i18n from 'i18n';

/**
 * The HistoryViewer component is abstract, and requires an Injector component
 * to be connected providing the query implementation for the appropriate
 * DataObject type
 */
const HistoryViewer = ({
  loading = false,
  graphQLErrors = [],
  compare = {},
  currentVersion = false,
  isInGridField = false,
  isPreviewable = false,
  schemaUrl = '',
  ListComponent,
  VersionDetailComponent,
  CompareWarningComponent,
  limit,
  recordId,
  page,
  isRevertable,
  actions,
  onSelect,
  onSetPage,
  onResize,
  toastActions,
  recordClass,
  recordClassSingularName,
  previewState,
}) => {
  const [versions, setVersions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Refetch version data from the "read" endpoint
   */
  const refreshVersionData = () => {
    if (!recordId) {
      return;
    }
    const sectionConfig = Config.getSection('SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController');
    const endpoint = sectionConfig.endpoints.read;
    const dataClass = recordClass;
    const url = `${endpoint}?dataClass=${dataClass}&id=${recordId}&page=${page}`;
    backend.get(url)
      .then(response => response.json())
      .then(responseJson => {
        setVersions(responseJson.versions);
        setTotalCount(responseJson.pageInfo.totalCount);
      })
      .catch(async (err) => {
        const message = await getJsonErrorMessage(err);
        actions.toasts.error(message);
      });
  };

  /**
   * List view is when either no current version is set, or only one of the two versions is
   * set for compare mode
   *
   * @returns {boolean}
   */
  const isListView = () => {
    // Nothing is set: initial list view
    if (!currentVersion) {
      return true;
    }
    // No compare mode data set: it's detail view
    if (!compare) {
      return false;
    }
    // Only part of the compare mode data is set: it's list view
    if (compare.versionFrom && !compare.versionTo) {
      return true;
    }
    return false;
  };

  /**
   * Returns a string to be used as the "class" attribute on the history viewer container
   *
   * @returns {string}
   */
  const getContainerClasses = () =>
    // GridFieldDetailForm provides its own padding, so apply a class to counteract this.
    classNames(
      'history-viewer',
      'fill-height',
      'panel--scrollable',
      {
        'history-viewer__compare-mode': compare,
        'history-viewer--no-margins': isInGridField && !isListView(),
      }
    );

  /**
   * Get the latest version from the list available (if there is one)
   *
   * @returns {object|null}
   */
  const getLatestVersion = () => {
    // Check whether the "current version" (in the store) is the latest draft
    if (currentVersion && currentVersion.latestDraftVersion === true) {
      return currentVersion;
    }
    // Look for one in the list of available versions
    const latestDraftVersion = versions
      .filter(version => version.latestDraftVersion === true);
    if (latestDraftVersion.length) {
      return latestDraftVersion[0];
    }
    return null;
  };

  /**
   * Handles setting the pagination page number
   *
   * @param {number} pageNum
   */
  const handleSetPage = (pageNum) => {
    if (typeof onSetPage === 'function') {
      onSetPage(pageNum);
    }
  };

  /**
   * Handler for after reverting
   */
  const handleAfterRevert = () => {
    if (window.location.href.indexOf('/admin/pages/history/show/') !== -1) {
      // if we're editing page history, then the browser will refresh the page when switching
      // between the content and history tabs, so just refresh version data
      refreshVersionData();
    } else {
      // if we're editing a datobject, then we need to reload the entire edit form so that
      // we're showing the correct version of the object (the one we just reverted to) in the edit form
      // set a timeout so that the user can see the success message before the page reloads
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  /**
   * Compare mode is not available when only one version exists
   *
   * @returns {boolean}
   */
  const compareModeAvailable = () => versions.length > 1;

  /**
   * Renders the detail form for a selected version
   *
   * @returns {HistoryViewerVersionDetail}
   */
  const renderVersionDetail = () => {
    const versionFrom = compare.versionFrom || false;
    const versionTo = compare.versionTo || false;
    // Insert variables into the schema URL via regex replacements
    const schemaVersionReplacements = {
      ':id': recordId,
      ':class': recordClass,
      ':version': currentVersion.version,
    };
    const schemaCompareReplacements = {
      ':id': recordId,
      ':class': recordClass,
      ':from': versionFrom.version || 0,
      ':to': versionTo.version || 0,
    };
    const schemaSearch = compare ? /:id|:class|:from|:to/g : /:id|:class|:version/g;
    const schemaReplacements = compare ? schemaCompareReplacements : schemaVersionReplacements;

    const version = compare ? versionFrom : currentVersion;
    const latestVersion = getLatestVersion();

    const props = {
      // comparison shows two versions as one, so by nature cannot be a single 'latest' version.
      isLatestVersion: !compare && latestVersion && latestVersion.version === version.version,
      isPreviewable,
      isRevertable,
      recordId,
      schemaUrl: schemaUrl.replace(schemaSearch, (match) => schemaReplacements[match]),
      version,
      compare,
      compareModeAvailable: compareModeAvailable(),
      previewState,
      recordClass,
      onAfterRevert: handleAfterRevert
    };
    return (
      <ResizeAware
        className={getContainerClasses()}
        onResize={({ width }) => onResize(width)}
      >
        <VersionDetailComponent {...props} />
      </ResizeAware>
    );
  };

  /**
   * Renders the react component for pagination.
   *
   * @returns {XML|null}
   */
  const renderPagination = () => {
    if (versions.length === 0 || totalCount <= limit) {
      return null;
    }
    const paginatorProps = {
      totalItems: totalCount,
      maxItemsPerPage: limit,
      currentPage: page,
      onChangePage: handleSetPage,
      title: i18n.inject(
        i18n._t(
          'HistoryViewer.NAME_HISTORY',
          '{name} history'
        ),
        { name: recordClassSingularName }
      )
    };
    return <Paginator {...paginatorProps} />;
  };

  /**
   * Render the list containing versions selected for comparison.
   * It is not the ListComponent's place to know the context in which it is being rendered
   * so it is the directive of this contextual component to tell it what stylistic adaptations
   * it should present based on the context (the type of list it contains).
   *
   * @returns {HistoryViewerVersionList|null}
   */
  const renderComparisonSelectionList = () => {
    const versionFrom = compare.versionFrom;
    if (!versionFrom) {
      return null;
    }
    const selectionListClasses = classNames(
      'history-viewer__table',
      'history-viewer__table--comparison-selected',
    );
    return (
      <ListComponent
        versions={[versionFrom]}
        extraClass={selectionListClasses}
      />
    );
  };

  /**
   * Renders a list of versions
   *
   * @returns {HistoryViewerVersionList}
   */
  const renderVersionList = () => {
    const hasVersionFrom = compare.versionFrom;
    return (
      <div className={getContainerClasses()}>
        <CompareWarningComponent />

        <div className={isInGridField ? '' : 'panel panel--padded panel--scrollable'}>
          {renderComparisonSelectionList()}
          <ListComponent
            versions={versions}
            showHeader={!compare || (compare && !hasVersionFrom)}
            compareModeAvailable={compareModeAvailable()}
          />

          <div className="history-viewer__pagination">
            {renderPagination()}
          </div>
        </div>
      </div>
    );
  };

  const renderCompareMode = () => {
    if (compare && compare.versionFrom && compare.versionTo) {
      return renderVersionDetail();
    }
    return renderVersionList();
  };

  /**
   * Refresh version data on initial mount
   */
  useEffect(() => {
    refreshVersionData();
    // Reset selected version on unmount to prevent data leaking between instances
    return () => {
      if (typeof onSelect === 'function') {
        onSelect(0);
      }
    };
  }, []);

  /**
   * Refresh version data when the page changes
   */
  useEffect(() => {
    if (versions.length > 0) {
      refreshVersionData();
    }
  }, [page]);

  /**
   * Display a toast if there were any new graphql errors
   */
  useEffect(() => {
    if (graphQLErrors.length) {
      toastActions.error(i18n._t('Admin.UNKNOWN_ERROR', 'An unknown error has occurred.'));
    }
  }, [graphQLErrors.length]);

  // Do not proceed if there are graphql error.
  // A toast message will be shown in useEffect
  if (graphQLErrors.length > 0) {
    return null;
  }

  if (!recordId) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  if (compareModeAvailable() && compare) {
    return renderCompareMode();
  }

  if (currentVersion) {
    return renderVersionDetail();
  }
  return renderVersionList();
};

HistoryViewer.propTypes = {
  loading: PropTypes.bool,
  graphQLErrors: PropTypes.arrayOf(PropTypes.string),
  contextKey: PropTypes.string,
  limit: PropTypes.number,
  ListComponent: PropTypes.elementType.isRequired,
  offset: PropTypes.number,
  recordId: PropTypes.number,
  currentVersion: PropTypes.oneOfType([PropTypes.bool, versionType]),
  compare: compareType,
  isInGridField: PropTypes.bool,
  isPreviewable: PropTypes.bool,
  isRevertable: PropTypes.bool,
  VersionDetailComponent: PropTypes.elementType.isRequired,
  CompareWarningComponent: PropTypes.elementType.isRequired,
  page: PropTypes.number,
  schemaUrl: PropTypes.string,
  previewState: PropTypes.oneOf(['edit', 'preview', 'split']),
  actions: PropTypes.object,
  onSelect: PropTypes.func,
  onSetPage: PropTypes.func,
  onResize: PropTypes.func,
  toastActions: PropTypes.shape({
    display: PropTypes.func,
    info: PropTypes.func,
    success: PropTypes.func,
    warning: PropTypes.func,
    error: PropTypes.func,
  }),
};

function mapStateToProps(state) {
  const {
    currentPage,
    currentVersion,
    compare,
  } = state.versionedAdmin.historyViewer;

  const { activeState } = state.viewMode;

  return {
    page: currentPage,
    currentVersion,
    compare,
    previewState: activeState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSelect(id) {
      dispatch(showVersion(id));
      dispatch(clearMessages());
    },
    onSetPage(page) {
      dispatch(setCurrentPage(page));
    },
    onResize(panelWidth) {
      dispatch(viewModeActions.enableOrDisableSplitMode(panelWidth));
    },
    // Note we can't use actions.toasts because that overrides actions.versions
    toastActions: bindActionCreators(toastsActions, dispatch),
  };
}

export { HistoryViewer as Component };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  historyViewerConfig,
  inject(
    ['HistoryViewerVersionList', 'HistoryViewerVersionDetail', 'HistoryViewerCompareWarning'],
    (ListComponent, VersionDetailComponent, CompareWarningComponent) => ({
      ListComponent,
      VersionDetailComponent,
      CompareWarningComponent,
    }),
    ({ contextKey }) => `VersionedAdmin.HistoryViewer.${contextKey}`
  )
)(HistoryViewer);
