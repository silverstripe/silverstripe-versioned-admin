/* global jest, test, describe, it, expect */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Component as HistoryViewerToolbar } from '../HistoryViewerToolbar';

test('HistoryViewerToolbar renders', async () => {
  const revertHandler = jest.fn();
  const mockRevertMutation = jest.fn((recordID, versionID) => Promise.resolve(versionID));
  const { container } = render(
    <HistoryViewerToolbar {...{
      FormActionComponent: ({ onClick }) => <div className="test-form-action" onClick={onClick} />,
      ViewModeComponent: () => <div className="test-view-mode" />,
      recordId: 123,
      versionId: 234,
      isRevertable: true,
      onAfterRevert: revertHandler,
      actions: {
        revertToVersion: mockRevertMutation
      }
    }}
    />
  );
  expect(container.querySelector('.toolbar')).not.toBeNull();
  fireEvent.click(container.querySelector('.test-form-action'));
  expect(mockRevertMutation).toBeCalledWith(123, 234, 'DRAFT', 'DRAFT');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(revertHandler).toBeCalledWith(234);
});
