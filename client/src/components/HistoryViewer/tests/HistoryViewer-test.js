/* eslint-disable import/no-extraneous-dependencies */
/* global jest, test, describe, it, expect */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component as HistoryViewer } from '../HistoryViewer';

let resolveBackend;
let rejectBackend;

jest.mock('lib/Backend', () => ({
  get: () => new Promise((resolve, reject) => {
    resolveBackend = resolve;
    rejectBackend = reject;
  })
}));

function makeEndpointJson() {
  return {
    json: () => ({
      versions: [
        {
          version: 14,
          author: {
            firstName: 'Michelle',
            surname: 'Masters'
          },
          publisher: null,
          published: false,
          latestDraftVersion: false,
          liveVersion: false,
          lastEdited: '2018-03-08 11:57:58'
        },
        {
          version: 13,
          author: {
            firstName: 'Scott',
            surname: 'Stockman'
          },
          publisher: null,
          published: false,
          latestDraftVersion: true,
          liveVersion: false,
          lastEdited: '2018-03-08 11:57:56'
        },
      ],
      pageInfo: {
        totalCount: 2
      }
    }),
  };
}

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

beforeEach(() => {
  lastToastErrorMessage = undefined;
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
    ListComponent: ({ versions }) => (
      <div data-testid="test-list">
        {versions.map((version) => <div data-testid="test-version" data-id={version.version} key={version.version}/>)}
      </div>
    ),
    VersionDetailComponent: ({ isLatestVersion, version, compareModeAvailable }) => (
      <div
        data-testid="test-version-detail"
        data-islatestversion={isLatestVersion}
        data-version={version.version}
        data-comparemodeavailable={compareModeAvailable}
      />
    ),
    CompareWarningComponent: () => <div data-testid="test-compare-warning"/>,
    onSelect: () => null,
    onSetPage: () => null,
    onResize: () => null,
    recordId: 1,
    limit: 100,
    page: 1,
    compare: false,
    actions: {
      toasts: {
        error: (message) => {
          lastToastErrorMessage = message;
        },
      },
    },
    ...obj
  };
}

test('HistoryViewer returns the node element from each version edge', async () => {
  render(
    <HistoryViewer {...makeProps()}/>
  );
  resolveBackend(makeEndpointJson());
  const versions = await screen.findAllByTestId('test-version');
  expect(versions[0].getAttribute('data-id')).toEqual('14');
  expect(versions[1].getAttribute('data-id')).toEqual('13');
});

test('HistoryViewer knows which version is the latestDraftVersion', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      }
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const el = await screen.findByTestId('test-version-detail');
  // Sleep 0 milliseconds to ensure the component has re-rendered after state change
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(el.getAttribute('data-islatestversion')).toEqual('false');
});

test('HistoryViewer knows which versions are not the the latestDraftVersion', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 13
      }
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const el = await screen.findByTestId('test-version-detail');
  // Sleep 0 milliseconds to ensure the component has re-rendered after state change
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(el.getAttribute('data-islatestversion')).toEqual('true');
});

test('HistoryViewer gives priority to the currentVersion', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 123,
        latestDraftVersion: true
      }
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const version = await screen.findByTestId('test-version-detail');
  // Sleep 0 milliseconds to ensure the component has re-rendered after state change
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(version.getAttribute('data-version')).toEqual('123');
});

test('HistoryViewer shows a loading state while loading results', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      loading: true
    })}
    />
  );
  expect(container.querySelectorAll('.cms-content-loading-spinner')).toHaveLength(1);
});

test('HistoryViewer should have called onSetPage and handleNextPage after next button in navigation clicked', async () => {
  const onSetPage = jest.fn();
  render(
    <HistoryViewer {...makeProps({
      onSetPage,
      limit: 1,
      page: 2
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const button = await screen.findByText('Previous');
  fireEvent.click(button);
  expect(onSetPage).toBeCalledWith(1);
});

test('HistoryViewer onSelect() called when components unmounts', async () => {
  const onSelect = jest.fn();
  const container = render(
    <HistoryViewer {...makeProps({
      onSelect
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  container.unmount();
  expect(onSelect).toBeCalled();
});

test('HistoryViewer isListView() returns there is a currentVersion and compare mode is false', async () => {
  // the only way that isListView() is used is as part of the logic to determine if the css class
  // history-viewer--no-margins is added
  const { container } = render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      },
      compare: false,
      isInGridField: true
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('test-version-detail');
  // Sleep 0 milliseconds to ensure the component has re-rendered after state change
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(container.querySelectorAll('.history-viewer')[0].classList).toContain('history-viewer--no-margins');
});

test('HistoryViewer compoareModeAvailable() returns true when more than one version is present', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      }
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const el = await screen.findByTestId('test-version-detail');
  // Sleep 0 milliseconds to ensure the component has re-rendered after state change
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(el.getAttribute('data-comparemodeavailable')).toEqual('true');
});

test('HistoryViewer compareModeAvailable() returns false with only one version', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      },
    })}
    />
  );
  resolveBackend({
    json: () => ({
      versions: [
        {
          version: 14,
          author: {
            firstName: 'Michelle',
            surname: 'Masters'
          },
          publisher: null,
          published: false,
          latestDraftVersion: false,
          liveVersion: false,
          lastEdited: '2018-03-08 11:57:58'
        },
      ],
      pageInfo: {
        totalCount: 1
      }
    }),
  });
  const el = await screen.findByTestId('test-version-detail');
  // Sleep 0 milliseconds to ensure the component has re-rendered after state change
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(el.getAttribute('data-comparemodeavailable')).toEqual('false');
});

test('HistoryViewer reject known error', async () => {
  render(
    <HistoryViewer {...makeProps()}/>
  );
  rejectBackend(createJsonError('Cannot read versions'));
  // sleep for 0 seconds to get the next tick
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(lastToastErrorMessage).toBe('Cannot read versions');
});

test('HistoryViewer reject unknown error', async () => {
  render(
    <HistoryViewer {...makeProps()}/>
  );
  rejectBackend();
  // sleep for 0 seconds to get the next tick
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(lastToastErrorMessage).toBe('An unknown error has occurred.');
});
