/* global window */
import React, { Component } from 'react';
import { Provider } from 'react-redux';

/**
 * The state router HOC encapsulates the pagination page number state for the
 * HistoryViewer's GraphQL query, pagination utilities and binding to the
 * SilverStripe Redux store.
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
        <Provider store={window.ss.store}>
          <RoutedComponent
            {...this.props}
            page={this.state.page}
            onPageChange={this.handlePage}
          />
        </Provider>
      );
    }
  }

  return HistoryViewerStateRouter;
};

export default historyStateRouter;
