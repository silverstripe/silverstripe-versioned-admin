/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Component as HistoryViewerVersion } from '../HistoryViewerVersion';

/**
 * Wrapper class to ensure the component is nested correctly before testing it
 */
class TestHistoryViewerVersion extends React.PureComponent {
  render() {
    const StateComponent = () => <div />;

    return (
      <table>
        <tbody>
          <HistoryViewerVersion StateComponent={StateComponent} {...this.props} />
        </tbody>
      </table>
    );
  }
}

describe('HistoryViewerVersion', () => {
  let component = null;
  let version = {};

  describe('getAuthor()', () => {
    beforeEach(() => {
      version = {
        Version: 3,
        Published: false,
        Author: {
          FirstName: 'John',
          Surname: 'Smith',
        },
        Publisher: {
          FirstName: 'Sarah',
          Surname: 'Smith',
        },
      };
    });

    it('returns the author name when unpublished', () => {
      component = ReactTestUtils.renderIntoDocument(
        <TestHistoryViewerVersion version={version} />
      );

      const viewerVersion = ReactTestUtils.findRenderedDOMComponentWithTag(
        component,
        'tr'
      );

      expect(viewerVersion.textContent).toContain('John Smith');
    });

    it('returns the publisher name when published', () => {
      version.Published = true;

      component = ReactTestUtils.renderIntoDocument(
        <TestHistoryViewerVersion version={version} />
      );

      const viewerVersion = ReactTestUtils.findRenderedDOMComponentWithTag(
        component,
        'tr'
      );

      expect(viewerVersion.textContent).toContain('Sarah Smith');
    });
  });
});
