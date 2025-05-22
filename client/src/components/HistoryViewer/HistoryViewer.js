/* global window */

import React, { Component } from 'react';
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
class HistoryViewer extends Component {
  constructor(props) {
    super(props);

    this.handleSetPage = this.handleSetPage.bind(this);
    this.handleAfterRevert = this.handleAfterRevert.bind(this);
    this.refreshVersionData = this.refreshVersionData.bind(this);

    this.state = {
      versions: [],
      totalCount: 0,
    };
  }

  componentDidMount() {
    this.refreshVersionData();
    // Display a toast if there were any pre-existing graphql errors
    const { graphQLErrors, toastActions } = this.props;
    if (graphQLErrors.length > 0) {
      toastActions.error(i18n._t('Admin.UNKNOWN_ERROR', 'An unknown error has occurred.'));
    }
  }

  componentDidUpdate(prevProps) {
    // Display a toast if there were any new graphql errors
    if (prevProps.graphQLErrors.length < this.props.graphQLErrors.length) {
      this.props.toastActions.error(i18n._t('Admin.UNKNOWN_ERROR', 'An unknown error has occurred.'));
    }

    // Manually handle state changes in the page number,
    if (this.state.versions.length === 0) {
      return;
    }
    if (prevProps.page !== this.props.page) {
      this.refreshVersionData();
    }
  }

  /**
   * Reset the selected version when unmounting HistoryViewer to prevent data leaking
   * between instances
   */
  componentWillUnmount() {
    const { onSelect } = this.props;
    if (typeof onSelect === 'function') {
      onSelect(0);
    }
  }

  /**
   * Refetch version data from the "read" endpoint
   */
  refreshVersionData() {
    if (!this.props.recordId) {
      return;
    }
    const sectionConfig = Config.getSection('SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController');
    const endpoint = sectionConfig.endpoints.read;
    const dataClass = this.props.recordClass;
    const url = `${endpoint}?dataClass=${dataClass}&id=${this.props.recordId}&page=${this.props.page}`;
    backend.get(url)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          versions: responseJson.versions,
          totalCount: responseJson.pageInfo.totalCount,
        });
      })
      .catch(async (err) => {
        const message = await getJsonErrorMessage(err);
        this.props.actions.toasts.error(message);
      });
  }

  /**
   * Returns a string to be used as the "class" attribute on the history viewer container
   *
   * @returns {string}
   */
  getContainerClasses() {
    const { compare, isInGridField } = this.props;

    // GridFieldDetailForm provides its own padding, so apply a class to counteract this.
    return classNames(
      'history-viewer',
      'fill-height',
      'panel--scrollable',
      {
        'history-viewer__compare-mode': compare,
        'history-viewer--no-margins': isInGridField && !this.isListView(),
      }
    );
  }

  /**
   * Get the latest version from the list available (if there is one)
   *
   * @returns {object|null}
   */
  getLatestVersion() {
    const { currentVersion } = this.props;

    // Check whether the "current version" (in the store) is the latest draft
    if (currentVersion && currentVersion.latestDraftVersion === true) {
      return currentVersion;
    }

    // Look for one in the list of available versions
    const latestDraftVersion = this.state.versions
      .filter(version => version.latestDraftVersion === true);

    if (latestDraftVersion.length) {
      return latestDraftVersion[0];
    }

    return null;
  }

  /**
   * List view is when either no current version is set, or only one of the two versions is
   * set for compare mode
   *
   * @returns {boolean}
   */
  isListView() {
    const { compare, currentVersion } = this.props;

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
  }

  /**
   * Handles setting the pagination page number
   *
   * @param {number} page
   */
  handleSetPage(page) {
    const { onSetPage } = this.props;
    if (typeof onSetPage === 'function') {
      onSetPage(page);
    }
  }

  /**
   * Handler for after reverting
   */
  handleAfterRevert() {
    if (window.location.href.indexOf('/admin/pages/history/show/') !== -1) {
      // if we're editing page history, then the browser will refresh the page when switching
      // between the content and history tabs, so just refresh version data
      this.refreshVersionData();
    } else {
      // if we're editing a datobject, then we need to reload the entire edit form so that
      // we're showing the correct version of the object (the one we just reverted to) in the edit form
      // set a timeout so that the user can see the success message before the page reloads
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  /**
   * Compare mode is not available when only one version exists
   *
   * @returns {boolean}
   */
  compareModeAvailable() {
    return this.state.versions.length > 1;
  }

  /**
   * Renders the detail form for a selected version
   *
   * @returns {HistoryViewerVersionDetail}
   */
  renderVersionDetail() {
    const {
      currentVersion,
      isPreviewable,
      isRevertable,
      recordId,
      recordClass,
      schemaUrl,
      VersionDetailComponent,
      compare,
      compare: { versionFrom = false, versionTo = false },
      previewState,
    } = this.props;

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
    const latestVersion = this.getLatestVersion();

    const props = {
      // comparison shows two versions as one, so by nature cannot be a single 'latest' version.
      isLatestVersion: !compare && latestVersion && latestVersion.version === version.version,
      isPreviewable,
      isRevertable,
      recordId,
      schemaUrl: schemaUrl.replace(schemaSearch, (match) => schemaReplacements[match]),
      version,
      compare,
      compareModeAvailable: this.compareModeAvailable(),
      previewState,
      recordClass: this.props.recordClass,
      onAfterRevert: this.handleAfterRevert
    };

    return (
      <ResizeAware
        className={this.getContainerClasses()}
        onResize={({ width }) => this.props.onResize(width)}
      >
        <VersionDetailComponent {...props} />
      </ResizeAware>
    );
  }

  /**
   * Renders the react component for pagination.
   *
   * @returns {XML|null}
   */
  renderPagination() {
    const totalCount = this.state.totalCount;
    const limit = this.props.limit;
    if (this.state.versions.length === 0 || totalCount <= limit) {
      return null;
    }
    const props = {
      totalItems: totalCount,
      maxItemsPerPage: limit,
      currentPage: this.props.page,
      onChangePage: this.handleSetPage,
    };
    return <Paginator {...props} />;
  }

  /**
   * Render the list containing versions selected for comparison.
   * It is not the ListComponent's place to know the context in which it is being rendered
   * so it is the directive of this contextual component to tell it what stylistic adaptations
   * it should present based on the context (the type of list it contains).
   *
   * @returns {HistoryViewerVersionList|null}
   */
  renderComparisonSelectionList() {
    const { compare: { versionFrom }, ListComponent } = this.props;

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
  }

  /**
   * Renders a list of versions
   *
   * @returns {HistoryViewerVersionList}
   */
  renderVersionList() {
    const {
      isInGridField,
      ListComponent,
      CompareWarningComponent,
      compare,
      compare: { versionFrom: hasVersionFrom },
    } = this.props;

    return (
      <div className={this.getContainerClasses()}>
        <CompareWarningComponent />

        <div className={isInGridField ? '' : 'panel panel--padded panel--scrollable'}>
          {this.renderComparisonSelectionList()}
          <ListComponent
            versions={this.state.versions}
            showHeader={!compare || (compare && !hasVersionFrom)}
            compareModeAvailable={this.compareModeAvailable()}
          />

          <div className="history-viewer__pagination">
            {this.renderPagination()}
          </div>
        </div>
      </div>
    );
  }

  renderCompareMode() {
    const { compare } = this.props;

    if (compare && compare.versionFrom && compare.versionTo) {
      return this.renderVersionDetail();
    }
    return this.renderVersionList();
  }

  render() {
    const { graphQLErrors, loading, compare, currentVersion, recordId } = this.props;

    // Do not proceed if there are graphql error.
    // A toast message will be shown in componentDidMount() or componentDidUpdate()
    if (graphQLErrors.length > 0) {
      return null;
    }

    if (!recordId) {
      return null;
    }

    if (loading) {
      return <Loading />;
    }

    if (this.compareModeAvailable() && compare) {
      return this.renderCompareMode();
    }

    if (currentVersion) {
      return this.renderVersionDetail();
    }

    return this.renderVersionList();
  }
}

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

HistoryViewer.defaultProps = {
  loading: false,
  graphQLErrors: [],
  compare: {},
  contextKey: '',
  currentVersion: false,
  isInGridField: false,
  isPreviewable: false,
  schemaUrl: '',
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
