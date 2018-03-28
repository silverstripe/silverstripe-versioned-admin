import React, { Component } from 'react';

/**
 * The state router HOC encapsulates the pagination page number state for the
 * HistoryViewer's GraphQL query, and pagination utilities.
 */
const historyStateRouter = (RoutedComponent) => {
  class HistoryViewerStateRouter extends Component {
    constructor(props) {
      super(props);

      this.handlePage = this.handlePage.bind(this);

      this.state = {
        page: 1,
      };
    }

    handlePage(page) {
      this.setState({ page });
    }

    render() {
      return (
        <RoutedComponent
          {...this.props}
          page={this.state.page}
          onPageChange={this.handlePage}
        />
      );
    }
  }

  return HistoryViewerStateRouter;
};

export default historyStateRouter;
