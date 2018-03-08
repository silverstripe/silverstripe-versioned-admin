import React, { Component } from 'react';
import { compose } from 'redux';
import historyStateRouter from 'components/HistoryViewer/HistoryViewerStateRouter';
import HistoryViewerVersionList from 'components/HistoryViewer/HistoryViewerVersionList';
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
   * @returns {array}
   */
  getVersions() {
    const versions = this.props.versions;
    const edges = (versions && versions.Versions.edges) || [];
    return edges.map((version) => version.node);
  }

  /**
   * Handles setting the pagination page number
   *
   * @param {number} page
   */
  handleSetPage(page) {
    // Note: data from Griddle is zero-indexed
    this.props.actions.versions.goToPage(page + 1);

    if (typeof this.props.onPageChange === 'function') {
      this.props.onPageChange(page + 1);
    }
  }

  /**
   * Handler for incrementing the set page
   */
  handleNextPage() {
    // Note: data for Griddle needs to be zero-indexed
    const currentPage = this.props.page - 1;
    this.handleSetPage(currentPage + 1);
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
    if (!this.props.versions) {
      return null;
    }

    const totalVersions = this.props.versions.Versions.pageInfo.totalCount || 0;
    if (totalVersions <= this.props.limit) {
      return null;
    }
    const props = {
      setPage: this.handleSetPage,
      maxPage: Math.ceil(this.props.versions.Versions.pageInfo.totalCount / this.props.limit),
      next: this.handleNextPage,
      nextText: i18n._t('HistoryViewer.NEXT', 'Next'),
      previous: this.handlePrevPage,
      previousText: i18n._t('HistoryViewer.PREVIOUS', 'Previous'),
      // Note: zero indexed
      currentPage: this.props.page - 1,
      useGriddleStyles: false,
    };
    return (
      <div className="griddle-footer">
        <Griddle.GridPagination {...props} />
      </div>
    );
  }

  render() {
    // Handle loading state
    if (this.props.loading) {
      return (
        <div className="flexbox-area-grow">
          <div key="overlay" className="cms-content-loading-overlay ui-widget-overlay-light" />
          <div key="spinner" className="cms-content-loading-spinner" />
        </div>
      );
    }

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
  limit: React.PropTypes.number,
  offset: React.PropTypes.number,
  recordId: React.PropTypes.number.isRequired,
  versions: React.PropTypes.object,
};

HistoryViewer.defaultProps = {
  versions: {},
};

export { HistoryViewer as Component };

const HistoryViewerProvider = compose(
  historyStateRouter
)(HistoryViewer);

export default HistoryViewerProvider;
