/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Component as HistoryViewerHeading } from '../HistoryViewerHeading';

class HeadingWrapper extends React.PureComponent {
  render() {
    return (
      <table>
        <thead>
          <HistoryViewerHeading {...this.props} />
        </thead>
      </table>
    );
  }
}

describe('HistoryViewerHeading', () => {
  it('has four columns when hasActions is true', () => {
    const component = ReactTestUtils.renderIntoDocument(
      <HeadingWrapper hasActions />
    );

    const result = ReactTestUtils.scryRenderedDOMComponentsWithTag(
      component,
      'th'
    );

    expect(result.length).toBe(4);
  });
});
