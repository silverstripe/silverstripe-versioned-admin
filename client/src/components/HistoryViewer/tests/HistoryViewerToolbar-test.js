/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Component as HistoryViewerToolbar } from '../HistoryViewerToolbar';

describe('HistoryViewerToolbar', () => {
  let component = null;
  const mockRevertMutation = jest.fn();
  const mockOnRevert = jest.fn();
  const FormActionComponent = () => <div />;

  describe('render()', () => {
    it('calls revert function then onRevert, and it renders', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerToolbar
          onRevert={mockOnRevert}
          actions={{ revertToVersion: mockRevertMutation }}
          FormActionComponent={FormActionComponent}
          recordId={123}
          versionId={234}
        />
      );

      component.handleRevert();

      expect(mockRevertMutation.mock.calls.length).toBe(1);
      expect(mockRevertMutation.mock.calls[0][0]).toBe(123);
      expect(mockRevertMutation.mock.calls[0][1]).toBe(234);
    });
  });
});
