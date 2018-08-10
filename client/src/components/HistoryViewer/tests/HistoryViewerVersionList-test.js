/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Component as HistoryViewerVersionList } from '../HistoryViewerVersionList';

describe('HistoryViewerVersionList', () => {
  const FormAlertComponent = () => <div />;
  const HeadingComponent = () => <li />;
  const VersionComponent = () => <div />;

  const component = ReactTestUtils.renderIntoDocument(
    <HistoryViewerVersionList
      FormAlertComponent={FormAlertComponent}
      HeadingComponent={HeadingComponent}
      VersionComponent={VersionComponent}
      versions={[]}
    />
  );

  describe('render()', () => {
    it('returns an unordered list', () => {
      const list = ReactTestUtils.scryRenderedDOMComponentsWithTag(
        component,
        'ul'
      );

      expect(list[0].className).toContain('history-viewer__table');
    });
  });
});
