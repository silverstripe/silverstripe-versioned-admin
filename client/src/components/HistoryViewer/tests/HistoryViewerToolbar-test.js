/* global jest, test, describe, it, expect */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Component as HistoryViewerToolbar } from '../HistoryViewerToolbar';

let resolveBackend;
let rejectBackend;
let lastBackendEndPoint;
let lastBackendData;

jest.mock('lib/Backend', () => ({
  post: (a, b) => new Promise((resolve, reject) => {
    lastBackendEndPoint = a;
    lastBackendData = b;
    resolveBackend = resolve;
    rejectBackend = reject;
  })
}));

const sectionConfigKey = 'SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController';
window.ss.config = {
  SecurityID: 1234567890,
  sections: [
    {
      name: sectionConfigKey,
      endpoints: {
        read: 'test/endpoint/read',
        revert: 'test/endpoint/revert',
      }
    },
  ],
};

let lastToastErrorMessage;
let onAfterRevert;
let showToolbarSuccessMessage;

beforeEach(() => {
  lastToastErrorMessage = undefined;
  onAfterRevert = undefined;
  showToolbarSuccessMessage = undefined;
});

function createJsonError(message) {
  return {
    response: {
      json: () => Promise.resolve({
        errors: [
          {
            value: message
          }
        ],
      }),
    },
  };
}

function makeProps(obj = {}) {
  return {
    FormActionComponent: ({ onClick }) => <div className="test-form-action" onClick={onClick} />,
    ViewModeComponent: () => <div className="test-view-mode" />,
    recordId: 123,
    versionId: 234,
    isRevertable: true,
    onAfterRevert: () => null,
    showToolbarSuccessMessage: () => null,
    recordClass: 'Lorem',
    actions: {
      toasts: {
        error: (message) => {
          lastToastErrorMessage = message;
        },
      },
      revertToVersion: () => null,
    },
    ...obj
  };
}

const setupTest = () => {
  onAfterRevert = jest.fn();
  showToolbarSuccessMessage = jest.fn();
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      onAfterRevert,
      showToolbarSuccessMessage,
    })}
    />
  );
  expect(container.querySelector('.toolbar')).not.toBeNull();
  fireEvent.click(container.querySelector('.test-form-action'));
};

test('HistoryViewerToolbar revert', async () => {
  setupTest();
  resolveBackend();
  expect(lastBackendEndPoint).toBe('test/endpoint/revert');
  expect(lastBackendData).toEqual({
    id: 123,
    toVersion: 234,
    dataClass: 'Lorem',
  });
  // Sleep 0 milliseconds to allow the mock backend post promise to the next then() block
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(showToolbarSuccessMessage).toBeCalledWith(234);
  expect(onAfterRevert).toBeCalled();
});

test('HistoryViewerToolbar revert reject known error', async () => {
  setupTest();
  rejectBackend(createJsonError('Cannot revert record'));
  // sleep for 0 seconds to get the next tick
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(lastToastErrorMessage).toBe('Cannot revert record');
});

test('HistoryViewerToolbar revert reject unknown error', async () => {
  setupTest();
  rejectBackend();
  // sleep for 0 seconds to get the next tick
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(lastToastErrorMessage).toBe('An unknown error has occurred.');
});
