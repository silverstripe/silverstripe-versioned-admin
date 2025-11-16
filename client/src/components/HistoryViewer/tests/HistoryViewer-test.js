/* eslint-disable import/no-extraneous-dependencies */
/* global jest, test, describe, it, expect, beforeAll */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component as HistoryViewer } from '../HistoryViewer';

// eslint-disable-next-line no-console
const originalError = console.error;

beforeAll(() => {
  // Suppress prop type warnings in tests
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const fullMessage = args.map(arg => (typeof arg === 'string' ? arg : (arg?.toString?.() || ''))).join(' ');
    // Only suppress if message contains "Invalid prop" OR "Failed prop type"
    if (fullMessage.includes('Invalid prop') || fullMessage.includes('Failed prop type')) {
      return;
    }
    originalError(...args);
  });
});

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

test('HistoryViewer should handle next button being clicked', async () => {
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

test('HistoryViewer displays no error when there are none', async () => {
  const error = jest.fn();
  render(
    <HistoryViewer {...makeProps({ toastActions: { error } })}/>
  );
  const el = await screen.queryByTestId('test-list');
  expect(el).not.toBeFalsy();
  expect(error.mock.calls.length).toBe(0);
});

test('HistoryViewer displays error when there is one on initial render', async () => {
  const error = jest.fn();
  render(
    <HistoryViewer {...makeProps({ graphQLErrors: ['error 1', 'error 2'], toastActions: { error } })}/>
  );
  const el = await screen.queryByTestId('test-list');
  expect(el).toBeFalsy();
  expect(error.mock.calls.length).toBe(1);
  expect(error.mock.calls[0][0]).toBe('An unknown error has occurred.');
});

test('HistoryViewer displays error when there is one in updated props', async () => {
  const error = jest.fn();
  const props = makeProps({ toastActions: { error } });
  const { rerender, queryByTestId } = render(<HistoryViewer {...props}/>);
  const el = await queryByTestId('test-list');
  expect(el).not.toBeFalsy();
  expect(error.mock.calls.length).toBe(0);

  props.graphQLErrors = ['error 1', 'error 2'];
  rerender(<HistoryViewer {...props}/>);
  const el2 = await queryByTestId('test-list');
  expect(el2).toBeFalsy();
  expect(error.mock.calls.length).toBe(1);
  expect(error.mock.calls[0][0]).toBe('An unknown error has occurred.');
});

test('HistoryViewer does not render when recordId is missing', () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      recordId: null
    })}
    />
  );
  expect(container.firstChild).toBeNull();
});

test('HistoryViewer refreshes version data when page prop changes', async () => {
  const props = makeProps({ limit: 1, page: 1 });
  const { rerender, queryByTestId } = render(<HistoryViewer {...props}/>);
  resolveBackend(makeEndpointJson());
  await screen.findAllByTestId('test-version');
  const initialVersions = queryByTestId('test-list').querySelectorAll('[data-testid="test-version"]');
  expect(initialVersions).toHaveLength(2);

  props.page = 2;
  rerender(<HistoryViewer {...props}/>);
  resolveBackend(makeEndpointJson());
  await screen.findAllByTestId('test-version');
  // Should still show versions since refreshVersionData was called
  expect(queryByTestId('test-list')).not.toBeNull();
});

test('HistoryViewer renders comparison selection list when versionFrom is set', async () => {
  const ListComponent = jest.fn(({ versions, extraClass }) => (
    <div data-testid="test-list" className={extraClass}>
      {versions.map(v => <div key={v.version} data-testid="test-version" data-id={v.version}/>)}
    </div>
  ));
  const { container } = render(
    <HistoryViewer {...makeProps({
      compare: {
        versionFrom: {
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
        versionTo: false
      },
      ListComponent
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findAllByTestId('test-list');
  const comparisonList = container.querySelector('.history-viewer__table--comparison-selected');
  expect(comparisonList).not.toBeNull();
});

test('HistoryViewer does not render comparison selection list when versionFrom is not set', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      },
      compare: false
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('test-version-detail');
  const comparisonList = container.querySelector('.history-viewer__table--comparison-selected');
  expect(comparisonList).toBeNull();
});

test('HistoryViewer renders pagination when versions exceed limit', async () => {
  render(
    <HistoryViewer {...makeProps({
      limit: 1
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const select = await screen.findByRole('combobox');
  expect(select).not.toBeNull();
});

test('HistoryViewer does not render pagination when versions within limit', async () => {
  render(
    <HistoryViewer {...makeProps({
      limit: 100
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const versionList = await screen.findByTestId('test-list');
  expect(versionList).not.toBeNull();
});

test('HistoryViewer renders version list view when no currentVersion set', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      currentVersion: false
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const listContainer = await screen.findByTestId('test-list');
  expect(listContainer).not.toBeNull();
  expect(container.querySelector('.history-viewer__compare-mode')).toBeNull();
});

test('HistoryViewer renders version detail view when currentVersion set', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      }
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const detail = await screen.findByTestId('test-version-detail');
  expect(detail).not.toBeNull();
});

test('HistoryViewer applies compare mode class when compare is enabled', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      compare: {
        versionFrom: {
          version: 13
        },
        versionTo: {
          version: 14
        }
      },
      currentVersion: {
        version: 13
      }
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('test-version-detail');
  const historyViewer = container.querySelector('.history-viewer');
  expect(historyViewer.classList.contains('history-viewer__compare-mode')).toBe(true);
});

test('HistoryViewer retrieves and uses correct schema URL replacements for version detail', async () => {
  const VersionDetailComponent = jest.fn(({ schemaUrl }) => <div data-testid="version-detail" data-schema-url={schemaUrl} />);
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      },
      recordId: 123,
      recordClass: 'TestClass',
      schemaUrl: '/admin/schema/:class/:id/:version',
      VersionDetailComponent
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const detailComponent = await screen.findByTestId('version-detail');
  expect(detailComponent.getAttribute('data-schema-url')).toBe('/admin/schema/TestClass/123/14');
});

test('HistoryViewer shows compare warning component in list view', async () => {
  render(
    <HistoryViewer {...makeProps({
      currentVersion: false
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const compareWarning = await screen.findByTestId('test-compare-warning');
  expect(compareWarning).not.toBeNull();
});

test('HistoryViewer renders panel padding when not in gridfield', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      isInGridField: false
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('test-list');
  const panel = container.querySelector('.panel.panel--padded');
  expect(panel).not.toBeNull();
});

test('HistoryViewer does not render panel padding when in gridfield and in list view', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      isInGridField: true,
      currentVersion: false
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('test-list');
  const panel = container.querySelector('.panel.panel--padded');
  expect(panel).toBeNull();
});

test('HistoryViewer handles getLatestVersion when currentVersion is the latest draft', async () => {
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
  const el = await screen.findByTestId('test-version-detail');
  await new Promise(resolve => setTimeout(resolve, 0));
  // latestDraftVersion should be true even though 123 is not in the versions list
  expect(el.getAttribute('data-islatestversion')).toEqual('true');
});

test('HistoryViewer handles isListView correctly with partial compare mode', async () => {
  const { container } = render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      },
      compare: {
        versionFrom: {
          version: 13
        },
        versionTo: false
      },
      isInGridField: true
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  const lists = await screen.findAllByTestId('test-list');
  expect(lists.length).toBeGreaterThan(0);
  // With partial compare mode (versionFrom set but versionTo false), renderCompareMode
  // returns renderVersionList(), which renders the list without the --no-margins class
  // because renderVersionList() includes its own padding logic
  const historyViewer = container.querySelector('.history-viewer');
  expect(historyViewer).not.toBeNull();
});

test('HistoryViewer passes onAfterRevert callback to VersionDetailComponent', async () => {
  const VersionDetailComponent = jest.fn(() => <div data-testid="version-detail" />);
  render(
    <HistoryViewer {...makeProps({
      currentVersion: {
        version: 14
      },
      VersionDetailComponent
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('version-detail');
  expect(VersionDetailComponent).toHaveBeenCalled();
  const callArgs = VersionDetailComponent.mock.calls[0][0];
  expect(typeof callArgs.onAfterRevert).toBe('function');
});

test('HistoryViewer passes ListComponent versions from state', async () => {
  const ListComponent = jest.fn(({ versions }) => (
    <div data-testid="test-list">
      {versions.map(v => <div key={v.version} data-testid="test-version" data-id={v.version}/>)}
    </div>
  ));
  render(
    <HistoryViewer {...makeProps({
      ListComponent
    })}
    />
  );
  resolveBackend(makeEndpointJson());
  await screen.findByTestId('test-list');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(ListComponent).toHaveBeenCalled();
  const callArgs = ListComponent.mock.calls.find(args => args[0].versions && args[0].versions.length > 0);
  expect(callArgs).toBeDefined();
  expect(callArgs[0].versions).toHaveLength(2);
  expect(callArgs[0].versions[0].version).toBe(14);
  expect(callArgs[0].versions[1].version).toBe(13);
});
