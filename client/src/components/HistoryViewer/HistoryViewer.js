/* global window */

import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import historyStateRouter from 'containers/HistoryViewer/HistoryViewerStateRouter';
import HistoryViewerVersionDetail from './HistoryViewerVersionDetail';
import HistoryViewerVersionList from './HistoryViewerVersionList';
import Loading from './Loading';
import { versionType } from 'types/versionType';
import Griddle from 'griddle-react';
import i18n from 'i18n';

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
   * Renders the detail form for a selected version
   *
   * @returns {HistoryViewerVersionDetail}
   */
  getVersionDetail() {
    const { currentVersion, recordId, recordClass } = this.props;

    const store = window.ss.store;
    const sectionConfigKey = 'SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController';
    const sectionConfig = store.getState().config.sections
      .find((section) => section.name === sectionConfigKey);
    const schemaUrlBase = `${sectionConfig.form.versionForm.schemaUrl}/${recordId}`;
    const schemaQueryString = `RecordClass=${recordClass}&RecordID=${recordId}&RecordVersion=${currentVersion}`;
    const schemaUrl = `${schemaUrlBase}?${schemaQueryString}`;

    const props = {
      schemaUrl,
      version: this.getVersions().filter((version) => version.Version === currentVersion)[0],
    };

    return <HistoryViewerVersionDetail {...props} />;
  }

  /**
   * Handles setting the pagination page number
   *
   * @param {number} page
   */
  handleSetPage(page) {
    // Note: data from Griddle is zero-indexed
    const newPage = page + 1;
    const { onPageChange, actions } = this.props;
    actions.versions.goToPage(newPage);
    if (typeof onPageChange === 'function') {
      onPageChange(newPage);
    }
  }

  /**
   * Handler for incrementing the set page
   */
  handleNextPage() {
    // Note: data for Griddle needs to be zero-indexed, so don't add 1 to this
    this.handleSetPage(this.props.page);
  }

  /**
   * Handler for decrementing the set page
   */
  handlePrevPage() {
    // Note: data for Griddle needs to be zero-indexed
    const currentPage = this.props.page - 1;
    if (currentPage < 1) {
      this.handleSetPage(currentPage);
      return;
    }
    this.handleSetPage(currentPage - 1);
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

  render() {
    const { loading, currentVersion } = this.props;

    // Handle loading state
    if (loading) {
      return <Loading />;
    }

    // Render the selected version details
    if (currentVersion) {
      return this.getVersionDetail();
    }

    // Render the version list
    return (
      <div className="history-viewer">
        <HistoryViewerVersionList
          versions={this.getVersions()}
        />

        <div className="history-viewer__pagination">
          {this.renderPagination()}
        </div>
      </div>
    );
  }
}

HistoryViewer.propTypes = {
  limit: PropTypes.number,
  offset: PropTypes.number,
  recordId: PropTypes.number.isRequired,
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
  actions: PropTypes.object,
};

HistoryViewer.defaultProps = {
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
  const historyViewerState = state.versionedAdmin.historyViewer;
  return {
    currentVersion: historyViewerState.currentVersion,
  };
}

export { HistoryViewer as Component };

export default compose(
  connect(mapStateToProps),
  historyStateRouter
)(HistoryViewer);
