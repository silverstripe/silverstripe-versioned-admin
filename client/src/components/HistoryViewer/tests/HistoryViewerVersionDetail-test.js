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
    recordClass: 'MyRecordClass',
    onAfterRevert: () => {},
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

test('HistoryViewerVersionDetail renders preview when isPreviewable and previewState is split', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'split',
    })}
    />
  );
  expect(screen.getByText('Preview')).not.toBeNull();
});

test('HistoryViewerVersionDetail does not render preview when previewState is edit', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'edit',
    })}
    />
  );
  expect(screen.queryByText('Preview')).toBeNull();
});

test('HistoryViewerVersionDetail renders preview when previewState is preview and isPreviewable is true', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'preview',
    })}
    />
  );
  expect(screen.getByText('Preview')).not.toBeNull();
});

test('HistoryViewerVersionDetail does not render preview when isPreviewable is false', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: false,
      previewState: 'split',
    })}
    />
  );
  expect(screen.queryByText('Preview')).toBeNull();
});

test('HistoryViewerVersionDetail does not render preview when in compare mode', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'split',
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
  expect(screen.queryByText('Preview')).toBeNull();
});

test('HistoryViewerVersionDetail hides details when isPreviewable and previewState is preview', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'preview',
    })}
    />
  );
  expect(screen.queryByText('List')).toBeNull();
  expect(screen.queryByText('Form Builder Loader')).toBeNull();
});

test('HistoryViewerVersionDetail shows details when previewState is edit', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'edit',
    })}
    />
  );
  expect(screen.getByText('List')).not.toBeNull();
  expect(screen.getByText('Form Builder Loader')).not.toBeNull();
});

test('HistoryViewerVersionDetail shows details when previewState is split', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'split',
    })}
    />
  );
  expect(screen.getByText('List')).not.toBeNull();
  expect(screen.getByText('Form Builder Loader')).not.toBeNull();
});

test('HistoryViewerVersionDetail passes correct versions array in normal mode', async () => {
  const mockListComponent = jest.fn(() => <div>List</div>);
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ListComponent: mockListComponent,
      version: {
        version: 5,
        absoluteLink: 'http://example.com',
        lastEdited: '2023-01-01',
        deleted: false,
      },
    })}
    />
  );
  const lastCall = mockListComponent.mock.calls[mockListComponent.mock.calls.length - 1][0];
  expect(lastCall.versions.length).toBe(1);
  expect(lastCall.versions[0].version).toBe(5);
});

test('HistoryViewerVersionDetail passes both versions in compare mode', async () => {
  const mockListComponent = jest.fn(() => <div>List</div>);
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ListComponent: mockListComponent,
      compare: {
        versionFrom: {
          version: 1,
          absoluteLink: 'http://example.com',
          lastEdited: '2023-01-01',
          deleted: false,
        },
        versionTo: {
          version: 3,
          absoluteLink: 'http://example.com',
          lastEdited: '2023-01-02',
          deleted: false,
        },
      },
    })}
    />
  );
  const lastCall = mockListComponent.mock.calls[mockListComponent.mock.calls.length - 1][0];
  expect(lastCall.versions.length).toBe(2);
  expect(lastCall.versions[0].version).toBe(3);
  expect(lastCall.versions[1].version).toBe(1);
});

test('HistoryViewerVersionDetail passes compareModeAvailable to ListComponent', async () => {
  const mockListComponent = jest.fn(() => <div>List</div>);
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ListComponent: mockListComponent,
      compareModeAvailable: true,
    })}
    />
  );
  const lastCall = mockListComponent.mock.calls[mockListComponent.mock.calls.length - 1][0];
  expect(lastCall.compareModeAvailable).toBe(true);
});

test('HistoryViewerVersionDetail applies compare class to list when in compare mode', async () => {
  const mockListComponent = jest.fn(() => <div>List</div>);
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ListComponent: mockListComponent,
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
          lastEdited: '2023-01-02',
          deleted: false,
        },
      },
    })}
    />
  );
  const lastCall = mockListComponent.mock.calls[mockListComponent.mock.calls.length - 1][0];
  expect(lastCall.extraClass).toContain('history-viewer__table--compare');
});

test('HistoryViewerVersionDetail does not apply compare class to list in normal mode', async () => {
  const mockListComponent = jest.fn(() => <div>List</div>);
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ListComponent: mockListComponent,
    })}
    />
  );
  const lastCall = mockListComponent.mock.calls[mockListComponent.mock.calls.length - 1][0];
  expect(lastCall.extraClass).not.toContain('history-viewer__table--compare');
});

test('HistoryViewerVersionDetail applies compare class to details form when in compare mode', async () => {
  const { container } = render(
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
          lastEdited: '2023-01-02',
          deleted: false,
        },
      },
    })}
    />
  );
  const detailsForm = container.querySelector('.history-viewer__version-detail');
  expect(detailsForm).not.toBeNull();
  expect(detailsForm.classList.contains('history-viewer__version-detail--compare')).toBe(true);
});

test('HistoryViewerVersionDetail renders CompareWarningComponent', async () => {
  render(
    <HistoryViewerVersionDetail {...makeProps()}/>
  );
  expect(screen.getByText('Compare Warning')).not.toBeNull();
});

test('HistoryViewerVersionDetail passes correct props to FormBuilderLoaderComponent', async () => {
  const mockFormBuilderLoader = jest.fn(() => <div>Form Builder Loader</div>);
  render(
    <HistoryViewerVersionDetail {...makeProps({
      FormBuilderLoaderComponent: mockFormBuilderLoader,
      schemaUrl: '/my-schema-url',
    })}
    />
  );
  const lastCall = mockFormBuilderLoader.mock.calls[mockFormBuilderLoader.mock.calls.length - 1][0];
  expect(lastCall.identifier).toBe('HistoryViewer.VersionDetail');
  expect(lastCall.schemaUrl).toBe('/my-schema-url');
});

test('HistoryViewerVersionDetail passes correct props to ToolbarComponent', async () => {
  const mockToolbar = jest.fn(({ forceDisabled }) => (
    <div data-testid="test-toolbar" data-forcedisabled={forceDisabled} />
  ));
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ToolbarComponent: mockToolbar,
      recordId: 42,
      recordClass: 'MyClass',
      isLatestVersion: true,
      isRevertable: true,
    })}
    />
  );
  const lastCall = mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0];
  expect(lastCall.identifier).toBe('HistoryViewer.VersionDetail.Toolbar');
  expect(lastCall.recordId).toBe(42);
  expect(lastCall.recordClass).toBe('MyClass');
  expect(lastCall.isLatestVersion).toBe(true);
  expect(lastCall.isRevertable).toBe(true);
  expect(lastCall.versionId).toBe(1);
});

test('HistoryViewerVersionDetail passes isPreviewable to ToolbarComponent', async () => {
  const mockToolbar = jest.fn(({ forceDisabled }) => (
    <div data-testid="test-toolbar" data-forcedisabled={forceDisabled} />
  ));
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ToolbarComponent: mockToolbar,
      isPreviewable: true,
    })}
    />
  );
  const lastCall = mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0];
  expect(lastCall.isPreviewable).toBe(true);
});

test('HistoryViewerVersionDetail renders main container with correct classes', async () => {
  const { container } = render(
    <HistoryViewerVersionDetail {...makeProps()}/>
  );
  const mainContainer = container.querySelector('.flexbox-area-grow.fill-width');
  expect(mainContainer).not.toBeNull();
});

test('HistoryViewerVersionDetail renders preview component with correct class and itemId', async () => {
  const mockPreview = jest.fn(({ className, itemId }) => (
    <div data-testid="preview-component" data-classname={className} data-itemid={itemId}>
      Preview
    </div>
  ));
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'split',
      PreviewComponent: mockPreview,
      version: {
        version: 7,
        absoluteLink: 'http://example.com',
        lastEdited: '2023-01-01',
        deleted: false,
      },
    })}
    />
  );
  const previewComponent = await screen.findByTestId('preview-component');
  expect(previewComponent.getAttribute('data-classname')).toContain('history-viewer__preview');
  expect(previewComponent.getAttribute('data-itemid')).toBe('7');
});

test('HistoryViewerVersionDetail passes correct archiveDate to preview link', async () => {
  const mockPreview = jest.fn(({ itemLinks }) => (
    <div data-testid="preview-component" data-archivedate={itemLinks?.preview?.Stage?.href}>
      Preview
    </div>
  ));
  render(
    <HistoryViewerVersionDetail {...makeProps({
      isPreviewable: true,
      previewState: 'split',
      PreviewComponent: mockPreview,
      version: {
        version: 1,
        absoluteLink: 'http://example.com/page',
        lastEdited: '2023-06-15',
        deleted: false,
      },
    })}
    />
  );
  const lastCall = mockPreview.mock.calls[mockPreview.mock.calls.length - 1][0];
  expect(lastCall.itemLinks.preview.Stage.href).toContain('archiveDate=2023-06-15');
  expect(lastCall.itemLinks.preview.Stage.type).toBe('text/html');
});

test('HistoryViewerVersionDetail calls onAfterRevert prop via ToolbarComponent', async () => {
  const mockOnAfterRevert = jest.fn();
  const mockToolbar = jest.fn(({ onAfterRevert }) => (
    <div data-testid="test-toolbar" onClick={onAfterRevert} />
  ));
  render(
    <HistoryViewerVersionDetail {...makeProps({
      ToolbarComponent: mockToolbar,
      onAfterRevert: mockOnAfterRevert,
    })}
    />
  );
  const lastCall = mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0];
  expect(lastCall.onAfterRevert).toBe(mockOnAfterRevert);
});
