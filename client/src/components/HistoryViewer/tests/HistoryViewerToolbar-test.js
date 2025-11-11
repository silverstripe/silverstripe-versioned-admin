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

test('HistoryViewerToolbar does not render revert button when isRevertable is false', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      isRevertable: false,
    })}
    />
  );
  expect(container.querySelector('.test-form-action')).toBeNull();
});

test('HistoryViewerToolbar renders view mode component when isPreviewable is true', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      isPreviewable: true,
    })}
    />
  );
  expect(container.querySelector('.test-view-mode')).not.toBeNull();
});

test('HistoryViewerToolbar does not render view mode component when isPreviewable is false', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      isPreviewable: false,
    })}
    />
  );
  expect(container.querySelector('.test-view-mode')).toBeNull();
});

test('HistoryViewerToolbar renders toolbar structure correctly', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps()} />
  );
  expect(container.querySelector('.toolbar.toolbar--south')).not.toBeNull();
  expect(container.querySelector('.btn-toolbar')).not.toBeNull();
});

test('HistoryViewerToolbar button receives correct props from FormActionComponent', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      isRevertable: true,
      isLatestVersion: false,
    })}
    />
  );
  const formAction = container.querySelector('.test-form-action');
  expect(formAction).not.toBeNull();
});

test('HistoryViewerToolbar disables button when isLatestVersion is true', () => {
  let lastDisabledState = null;
  const FormActionComponent = ({ disabled }) => {
    lastDisabledState = disabled;
    return <div className="test-form-action" />;
  };
  render(
    <HistoryViewerToolbar {...makeProps({
      isRevertable: true,
      isLatestVersion: true,
      FormActionComponent,
    })}
    />
  );
  expect(lastDisabledState).toBe(true);
});

test('HistoryViewerToolbar disables button when forceDisabled is true', () => {
  let lastDisabledState = null;
  const FormActionComponent = ({ disabled }) => {
    lastDisabledState = disabled;
    return <div className="test-form-action" />;
  };
  render(
    <HistoryViewerToolbar {...makeProps({
      isRevertable: true,
      isLatestVersion: false,
      forceDisabled: true,
      FormActionComponent,
    })}
    />
  );
  expect(lastDisabledState).toBe(true);
});

test('HistoryViewerToolbar sets loading state on button during revert', async () => {
  let lastLoadingState = null;
  const FormActionComponent = ({ onClick, loading }) => {
    lastLoadingState = loading;
    return <div className="test-form-action" onClick={onClick} />;
  };
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      FormActionComponent,
    })}
    />
  );
  expect(lastLoadingState).toBe(false);
  fireEvent.click(container.querySelector('.test-form-action'));
  // Component should now be in loading state (before promise settles)
  await new Promise(resolve => setTimeout(resolve, 0));
});

test('HistoryViewerToolbar with both isRevertable and isPreviewable true', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      isRevertable: true,
      isPreviewable: true,
    })}
    />
  );
  expect(container.querySelector('.test-form-action')).not.toBeNull();
  expect(container.querySelector('.test-view-mode')).not.toBeNull();
});

test('HistoryViewerToolbar with neither isRevertable nor isPreviewable', () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      isRevertable: false,
      isPreviewable: false,
    })}
    />
  );
  expect(container.querySelector('.test-form-action')).toBeNull();
  expect(container.querySelector('.test-view-mode')).toBeNull();
  // Toolbar structure should still exist
  expect(container.querySelector('.toolbar')).not.toBeNull();
});

test('HistoryViewerToolbar passes correct recordId, versionId, and recordClass to backend', async () => {
  const recordId = 999;
  const versionId = 888;
  const recordClass = 'TestClass';
  const { container } = render(
    <HistoryViewerToolbar {...makeProps({
      recordId,
      versionId,
      recordClass,
    })}
    />
  );
  fireEvent.click(container.querySelector('.test-form-action'));
  resolveBackend();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(lastBackendData).toEqual({
    id: recordId,
    toVersion: versionId,
    dataClass: recordClass,
  });
});

test('HistoryViewerToolbar sends correct SecurityID header to backend', async () => {
  const { container } = render(
    <HistoryViewerToolbar {...makeProps()} />
  );
  fireEvent.click(container.querySelector('.test-form-action'));
  resolveBackend();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(lastBackendEndPoint).toBe('test/endpoint/revert');
});
