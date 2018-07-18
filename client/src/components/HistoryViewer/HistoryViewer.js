/* global window */

import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Griddle from 'griddle-react';
import historyViewerConfig from 'containers/HistoryViewer/HistoryViewerConfig';
import i18n from 'i18n';
import { inject } from 'lib/Injector';
import Loading from 'components/Loading/Loading';
import { setCurrentPage, showVersion, setCompareMode } from 'state/historyviewer/HistoryViewerActions';
import { versionType } from 'types/versionType';

/**
 * The HistoryViewer component is abstract, and requires an Injector component
 * to be connected providing the GraphQL query implementation for the appropriate
 * DataObject type
 */
class HistoryViewer extends Component {
  constructor(props) {
    super(props);

    this.handleSetPage = this.handleSetPage.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handlePrevPage = this.handlePrevPage.bind(this);
    this.handleDismissCompare = this.handleDismissCompare.bind(this);
  }

  /**
   * Manually handle state changes in the page number, because Griddle doesn't support Redux.
   * See: https://github.com/GriddleGriddle/Griddle/issues/626
   *
   * @param {object} prevProps
   */
  componentDidUpdate(prevProps) {
    const { page: prevPage } = prevProps;
    const { page: currentPage, actions: { versions } } = this.props;

    if (prevPage !== currentPage && typeof versions.goToPage === 'function') {
      versions.goToPage(currentPage);
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
   * Returns the result of the GraphQL version history query
   *
   * @returns {Array}
   */
  getVersions() {
    const { versions } = this.props;
    const edges = (versions && versions.Versions && versions.Versions.edges)
      ? versions.Versions.edges
      : [];
    return edges.map((version) => version.node);
  }

  /**
   * Get the latest (highest) version number from the list available. If we are not on page
   * zero then it's always false, because there are higher versions that we aren't aware of
   * in this context.
   *
   * @returns {object}
   */
  getLatestVersion() {
    const { page } = this.props;

    // Page numbers are not zero based as they come from GriddlePage numbers
    if (page > 1) {
      return false;
    }
    return this.getVersions()
      .reduce((prev, current) => {
        if (prev.Version > current.Version) {
          return prev;
        }
        return current;
      });
  }

  /**
   * Handles setting the pagination page number
   *
   * @param {number} page
   */
  handleSetPage(page) {
    const { onSetPage } = this.props;
    if (typeof onSetPage === 'function') {
      // Note: data from Griddle is zero-indexed
      onSetPage(page + 1);
    }
  }

  /**
   * Handler for incrementing the set page
   */
  handleNextPage() {
    const { page } = this.props;
    // Note: data for Griddle needs to be zero-indexed, so don't add 1 to this
    this.handleSetPage(page);
  }

  /**
   * Handler for decrementing the set page
   */
  handlePrevPage() {
    const { page } = this.props;
    // Note: data for Griddle needs to be zero-indexed
    const currentPage = page - 1;
    if (currentPage < 1) {
      this.handleSetPage(currentPage);
      return;
    }
    this.handleSetPage(currentPage - 1);
  }

  handleDismissCompare() {
    this.props.onDismissCompare();
  }

  /**
   * Renders a notice indicating the user is in compare mode (iff compare mode is active)
   *
   * @returns {string}
   */
  renderCompareWarning() {
    if (!this.props.compareMode) {
      return '';
    }

    return (
      <div className="history-viewer__compare-notice">
        <span className="notice-message">
          <strong>{i18n._t('HistoryViewer.COMPARE_MODE', 'Compare mode')}: </strong>
          {i18n._t('HistoryViewer.SELECT_PROMPT', 'Select two versions')}
        </span>
        <button className="btn dismiss-button font-icon-cancel" onClick={this.handleDismissCompare}>
          {i18n._t('HistoryViewer.EXIT', 'Exit')}
        </button>
      </div>
    );
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
      recordId,
      recordClass,
      schemaUrl,
      VersionDetailComponent,
    } = this.props;

    // Insert variables into the schema URL via regex replacements
    const schemaReplacements = {
      ':id': recordId,
      ':class': recordClass,
      ':version': currentVersion,
    };

    // eslint-disable-next-line no-shadow
    const version = this.getVersions().find(version => version.Version === currentVersion);
    const latestVersion = this.getLatestVersion();

    const props = {
      isLatestVersion: latestVersion && latestVersion.Version === version.Version,
      isPreviewable,
      recordId,
      schemaUrl: schemaUrl.replace(/:id|:class|:version/g, (match) => schemaReplacements[match]),
      version,
    };

    return (
      <div className="history-viewer fill-height">
        <VersionDetailComponent {...props} />
      </div>
    );
  }

  /**
   * Renders the react component for pagination.
   * Currently borrows the pagination from Griddle, to keep styling consistent
   * between the two views.
   *
   * See: ThumbnailView.js
   *
   * @returns {XML|null}
   */
  renderPagination() {
    const { limit, page, versions } = this.props;

    if (!versions) {
      return null;
    }

    const totalVersions = versions.Versions
      ? versions.Versions.pageInfo.totalCount
      : 0;

    if (totalVersions <= limit) {
      return null;
    }

    const props = {
      setPage: this.handleSetPage,
      maxPage: Math.ceil(totalVersions / limit),
      next: this.handleNextPage,
      nextText: i18n._t('HistoryViewer.NEXT', 'Next'),
      previous: this.handlePrevPage,
      previousText: i18n._t('HistoryViewer.PREVIOUS', 'Previous'),
      // Note: zero indexed
      currentPage: page - 1,
      useGriddleStyles: false,
    };

    return (
      <div className="griddle-footer">
        <Griddle.GridPagination {...props} />
      </div>
    );
  }

  /**
   * Renders a list of versions
   *
   * @returns {HistoryViewerVersionList}
   */
  renderVersionList() {
    const { isPreviewable, ListComponent, onSelect } = this.props;

    return (
      <div className="history-viewer fill-height">
        {this.renderCompareWarning()}
        <div className={isPreviewable ? 'panel panel--padded panel--scrollable' : ''}>
          <ListComponent
            onSelect={onSelect}
            versions={this.getVersions()}
          />

          <div className="history-viewer__pagination">
            {this.renderPagination()}
          </div>
        </div>
      </div>
    );
  }
  
  renderCompareMode() {
    const { compareFrom, compareTo } = this.props;
    if (compareFrom && compareTo) {
        return this.renderVersionDetail();
    }
    return this.renderVersionList();
  }

  render() {
    const { loading, compareMode, currentVersion } = this.props;

    if (loading) {
      return <Loading />;
    }
    
    if (compareMode) {
      return this.renderCompareMode();
    }

    if (currentVersion) {
      return this.renderVersionDetail();
    }

    return this.renderVersionList();
  }
}

HistoryViewer.propTypes = {
  contextKey: PropTypes.string,
  limit: PropTypes.number,
  ListComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  offset: PropTypes.number,
  recordId: PropTypes.number.isRequired,
  currentVersion: PropTypes.number,
  compareMode: PropTypes.bool,
  isPreviewable: PropTypes.bool,
  VersionDetailComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  versions: PropTypes.shape({
    Versions: PropTypes.shape({
      pageInfo: PropTypes.shape({
        totalCount: PropTypes.number,
      }),
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: versionType,
      })),
    }),
  }),
  page: PropTypes.number,
  schemaUrl: PropTypes.string,
  actions: PropTypes.object,
  onSelect: PropTypes.func,
  onSetPage: PropTypes.func,
};

HistoryViewer.defaultProps = {
  contextKey: '',
  currentVersion: 0,
  isPreviewable: false,
  schemaUrl: '',
  versions: {
    Versions: {
      pageInfo: {
        totalCount: 0,
      },
      edges: [],
    },
  },
};


function mapStateToProps(state) {
  const { currentPage, currentVersion, compareMode, compareFrom, compareTo } = state.versionedAdmin.historyViewer;

  return {
    page: currentPage,
    currentVersion,
    compareMode,
    compareFrom,
    compareTo,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSelect(id) {
      dispatch(showVersion(id));
    },
    onSetPage(page) {
      dispatch(setCurrentPage(page));
    },
    onDismissCompare() {
      dispatch(setCompareMode(false));
    },
  };
}

export { HistoryViewer as Component };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  historyViewerConfig,
  inject(
    ['HistoryViewerVersionList', 'HistoryViewerVersionDetail'],
    (HistoryViewerVersionList, HistoryViewerVersionDetail) => ({
      ListComponent: HistoryViewerVersionList,
      VersionDetailComponent: HistoryViewerVersionDetail,
    }),
    ({ contextKey }) => `VersionedAdmin.HistoryViewer.${contextKey}`
  )
)(HistoryViewer);
