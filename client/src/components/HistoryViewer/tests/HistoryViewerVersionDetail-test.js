/* eslint-disable import/no-extraneous-dependencies */
/* global jest, test, describe, it, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Component as HistoryViewerVersionDetail } from '../HistoryViewerVersionDetail';

function makeProps(obj = {}) {
  return {
    isLatestVersion: false,
    isPreviewable: false,
    isRevertable: false,
    ListComponent: () => <div>List</div>,
    CompareWarningComponent: () => <div>Compare Warning</div>,
    PreviewComponent: () => <div>Preview</div>,
    ToolbarComponent: ({ forceDisabled }) => (
      <div data-testid="test-toolbar" data-forcedisabled={forceDisabled} />
    ),
    FormBuilderLoaderComponent: () => <div>Form Builder Loader</div>,
    recordId: 1,
    schemaUrl: '/schema',
    version: {
      version: 1,
      absoluteLink: 'http://example.com',
      lastEdited: '2023-01-01',
      deleted: false,
    },
    compare: false,
    previewState: 'edit',
    ...obj,
  };
}

test('HistoryViewerVersionDetail passes forceDisabled as true when version.deleted is true', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      version: {
        version: 1,
        absoluteLink: 'http://example.com',
        lastEdited: '2023-01-01',
        deleted: true,
      },
    })}
    />
  );
  const toolbar = await screen.findByTestId('test-toolbar');
  expect(toolbar.getAttribute('data-forcedisabled')).toEqual('true');
});

test('HistoryViewerVersionDetail passes forceDisabled as false when version.deleted is false', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      version: {
        version: 1,
        absoluteLink: 'http://example.com',
        lastEdited: '2023-01-01',
        deleted: false,
      },
    })}
    />
  );
  const toolbar = await screen.findByTestId('test-toolbar');
  expect(toolbar.getAttribute('data-forcedisabled')).toEqual('false');
});

test('HistoryViewerVersionDetail does not render toolbar when in compare mode', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      compare: {
        versionFrom: {
          version: 1,
          absoluteLink: 'http://example.com',
          lastEdited: '2023-01-01',
          deleted: false,
        },
        versionTo: {
          version: 2,
          absoluteLink: 'http://example.com',
          lastEdited: '2023-01-01',
          deleted: false,
        },
      },
    })}
    />
  );
  const toolbar = screen.queryByTestId('test-toolbar');
  expect(toolbar).toBeNull();
});
