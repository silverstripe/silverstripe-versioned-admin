/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import HistoryViewerVersionList from '../HistoryViewerVersionList';

describe('HistoryViewerVersionList', () => {
  const component = ReactTestUtils.renderIntoDocument(
    <HistoryViewerVersionList versions={[]} />
  );

  describe('render()', () => {
    it('returns a table', () => {
      const list = ReactTestUtils.scryRenderedDOMComponentsWithTag(
        component,
        'table'
      );

      expect(list[0].className).toContain('table-hover');
    });
  });
});
