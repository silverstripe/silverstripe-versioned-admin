/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import HistoryViewerHeading from '../HistoryViewerHeading';

describe('HistoryViewerHeading', () => {
  it('has four columns when hasActions is true', () => {
    const component = ReactTestUtils.renderIntoDocument(
      <table>
        <thead>
          <HistoryViewerHeading hasActions />
        </thead>
      </table>
    );

    const result = ReactTestUtils.findRenderedDOMComponentWithTag(
      component,
      'th'
    );

    expect(result.toBe).toEqual(4);
  })
});
