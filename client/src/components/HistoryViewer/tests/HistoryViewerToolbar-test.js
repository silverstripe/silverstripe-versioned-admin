/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Component as HistoryViewerToolbar } from '../HistoryViewerToolbar';

describe('HistoryViewerToolbar', () => {
  const FormActionComponent = () => <div />;
  const ViewModeComponent = () => <div />;
  let component = null;
  let mockRevertMutation;
  let revertHandler;

  beforeEach(() => {
    mockRevertMutation = jest.fn((recordID, versionID) => Promise.resolve(versionID));
    revertHandler = jest.fn();
  });

  describe('render()', () => {
    it('calls revert function then onAfterRevert on success, and it renders', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerToolbar
          onAfterRevert={revertHandler}
          actions={{ revertToVersion: mockRevertMutation }}
          FormActionComponent={FormActionComponent}
          ViewModeComponent={ViewModeComponent}
          recordId={123}
          versionId={234}
        />
      );

      return component.handleRevert()
        .then(() => {
          expect(mockRevertMutation.mock.calls.length).toBe(1);
          expect(mockRevertMutation.mock.calls[0][0]).toBe(123);
          expect(mockRevertMutation.mock.calls[0][1]).toBe(234);
          expect(revertHandler.mock.calls.length).toBe(1);
          expect(revertHandler.mock.calls[0][0]).toBe(234);
        });
    });
  });
});
