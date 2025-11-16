/* global jest, test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Component as HistoryViewerVersionList } from '../HistoryViewerVersionList';

function makeProps(obj = {}) {
  return {
    FormAlertComponent: () => <div />,
    HeadingComponent: () => <li />,
    VersionComponent: () => <div />,
    versions: [],
    compare: false,
    currentVersion: null,
    compareModeAvailable: true,
    showHeader: true,
    extraClass: 'history-viewer__table',
    messages: [],
    ...obj
  };
}

test('HistoryViewerVersionList returns an unordered list', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps()} />
  );
  expect(container.querySelector('ul.history-viewer__table')).not.toBeNull();
});

test('HistoryViewerVersionList renders with correct role attribute', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps()} />
  );
  expect(container.querySelector('ul[role="table"]')).not.toBeNull();
});

test('HistoryViewerVersionList applies extraClass to the table', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({ extraClass: 'custom-class' })} />
  );
  expect(container.querySelector('ul.custom-class')).not.toBeNull();
});

test('HistoryViewerVersionList applies headerless class when showHeader is false', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({ showHeader: false })} />
  );
  expect(container.querySelector('ul.history-viewer__table--headerless')).not.toBeNull();
});

test('HistoryViewerVersionList does not apply headerless class when showHeader is true', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({ showHeader: true })} />
  );
  const ul = container.querySelector('ul');
  expect(ul.classList.contains('history-viewer__table--headerless')).toBe(false);
});

test('HistoryViewerVersionList renders HeadingComponent when showHeader is true', () => {
  const HeadingComponent = jest.fn(() => <li data-testid="heading" />);
  render(
    <HistoryViewerVersionList {...makeProps({
      showHeader: true,
      HeadingComponent,
    })}
    />
  );
  expect(screen.getByTestId('heading')).not.toBeNull();
  expect(HeadingComponent).toHaveBeenCalled();
});

test('HistoryViewerVersionList does not render HeadingComponent when showHeader is false', () => {
  const HeadingComponent = jest.fn(() => <li data-testid="heading" />);
  render(
    <HistoryViewerVersionList {...makeProps({
      showHeader: false,
      HeadingComponent,
    })}
    />
  );
  expect(screen.queryByTestId('heading')).toBeNull();
});

test('HistoryViewerVersionList passes compareModeAvailable to HeadingComponent', () => {
  const HeadingComponent = jest.fn(() => <li />);
  render(
    <HistoryViewerVersionList {...makeProps({
      compareModeAvailable: true,
      HeadingComponent,
    })}
    />
  );
  expect(HeadingComponent).toHaveBeenCalledWith(expect.objectContaining({
    compareModeAvailable: true,
  }), expect.anything());
});

test('HistoryViewerVersionList renders multiple VersionComponents for each version', () => {
  const VersionComponent = jest.fn(() => <div data-testid="version" />);
  const versions = [
    { version: 1, draft: false, published: true },
    { version: 2, draft: true, published: false },
    { version: 3, draft: false, published: true },
  ];
  render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      VersionComponent,
    })}
    />
  );
  const versionElements = screen.getAllByTestId('version');
  expect(versionElements).toHaveLength(3);
  expect(VersionComponent).toHaveBeenCalledTimes(3);
});

test('HistoryViewerVersionList passes version data to VersionComponent', () => {
  const VersionComponent = jest.fn(() => <div />);
  const testVersion = { version: 42, draft: false, published: true };
  render(
    <HistoryViewerVersionList {...makeProps({
      versions: [testVersion],
      VersionComponent,
    })}
    />
  );
  expect(VersionComponent).toHaveBeenCalledWith(expect.objectContaining({
    version: testVersion,
  }), expect.anything());
});

test('HistoryViewerVersionList marks current version as active when not in compare mode', () => {
  const VersionComponent = jest.fn(() => <div />);
  const currentVersion = { version: 2, draft: false, published: true };
  const versions = [
    { version: 1, draft: false, published: true },
    currentVersion,
    { version: 3, draft: false, published: true },
  ];
  render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      currentVersion,
      compare: false,
      VersionComponent,
    })}
    />
  );
  const calls = VersionComponent.mock.calls;
  expect(calls[1][0].isActive).toBe(true);
  expect(calls[0][0].isActive).toBe(false);
  expect(calls[2][0].isActive).toBe(false);
});

test('HistoryViewerVersionList marks versionFrom as active in compare mode', () => {
  const VersionComponent = jest.fn(() => <div />);
  const versionFrom = { version: 1, draft: false, published: true };
  const versionTo = { version: 3, draft: false, published: true };
  const versions = [
    versionFrom,
    { version: 2, draft: false, published: true },
    versionTo,
  ];
  const compare = { versionFrom, versionTo };
  render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      compare,
      VersionComponent,
    })}
    />
  );
  const calls = VersionComponent.mock.calls;
  expect(calls[0][0].isActive).toBe(true);
  expect(calls[1][0].isActive).toBe(false);
});

test('HistoryViewerVersionList marks versionTo as active in compare mode', () => {
  const VersionComponent = jest.fn(() => <div />);
  const versionFrom = { version: 1, draft: false, published: true };
  const versionTo = { version: 3, draft: false, published: true };
  const versions = [
    versionFrom,
    { version: 2, draft: false, published: true },
    versionTo,
  ];
  const compare = { versionFrom, versionTo };
  render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      compare,
      VersionComponent,
    })}
    />
  );
  const calls = VersionComponent.mock.calls;
  expect(calls[2][0].isActive).toBe(true);
  expect(calls[0][0].isActive).toBe(true);
  expect(calls[1][0].isActive).toBe(false);
});

test('HistoryViewerVersionList ignores currentVersion when in compare mode', () => {
  const VersionComponent = jest.fn(() => <div />);
  const currentVersion = { version: 2, draft: false, published: true };
  const versionFrom = { version: 1, draft: false, published: true };
  const versionTo = { version: 3, draft: false, published: true };
  const versions = [
    versionFrom,
    currentVersion,
    versionTo,
  ];
  const compare = { versionFrom, versionTo };
  render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      currentVersion,
      compare,
      VersionComponent,
    })}
    />
  );
  const calls = VersionComponent.mock.calls;
  expect(calls[1][0].isActive).toBe(false);
});

test('HistoryViewerVersionList renders messages when provided', () => {
  const FormAlertComponent = jest.fn(() => <div data-testid="alert" />);
  const messages = [
    { id: '1', message: 'Message 1', type: 'info' },
    { id: '2', message: 'Message 2', type: 'warning' },
  ];
  render(
    <HistoryViewerVersionList {...makeProps({
      messages,
      FormAlertComponent,
    })}
    />
  );
  const alerts = screen.getAllByTestId('alert');
  expect(alerts).toHaveLength(2);
  expect(FormAlertComponent).toHaveBeenCalledTimes(2);
});

test('HistoryViewerVersionList passes message data to FormAlertComponent', () => {
  const FormAlertComponent = jest.fn(() => <div />);
  const testMessage = { id: 'msg-1', message: 'Test message', type: 'error' };
  render(
    <HistoryViewerVersionList {...makeProps({
      messages: [testMessage],
      FormAlertComponent,
    })}
    />
  );
  expect(FormAlertComponent).toHaveBeenCalledWith(expect.objectContaining({
    type: testMessage.type,
    value: testMessage.message,
  }), expect.anything());
});

test('HistoryViewerVersionList does not render messages container when no messages', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({ messages: [] })} />
  );
  expect(container.querySelector('.history-viewer__messages')).toBeNull();
});

test('HistoryViewerVersionList passes compare and compareModeAvailable to VersionComponent', () => {
  const VersionComponent = jest.fn(() => <div />);
  const compare = false;
  const compareModeAvailable = true;
  render(
    <HistoryViewerVersionList {...makeProps({
      versions: [{ version: 1, draft: false }],
      compare,
      compareModeAvailable,
      VersionComponent,
    })}
    />
  );
  expect(VersionComponent).toHaveBeenCalledWith(expect.objectContaining({
    compare,
    compareModeAvailable,
  }), expect.anything());
});

test('HistoryViewerVersionList uses version number as key', () => {
  const VersionComponent = ({ version }) => <div key={version.version}>{version.version}</div>;
  const versions = [
    { version: 1, draft: false, published: true },
    { version: 5, draft: false, published: true },
    { version: 10, draft: false, published: true },
  ];
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      VersionComponent,
    })}
    />
  );
  expect(container.textContent).toContain('1');
  expect(container.textContent).toContain('5');
  expect(container.textContent).toContain('10');
});

test('HistoryViewerVersionList renders empty list when no versions provided', () => {
  const VersionComponent = jest.fn(() => <div data-testid="version" />);
  render(
    <HistoryViewerVersionList {...makeProps({
      versions: [],
      VersionComponent,
    })}
    />
  );
  expect(screen.queryByTestId('version')).toBeNull();
});

test('HistoryViewerVersionList handles object extraClass', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({
      extraClass: { 'custom-class': true, 'another-class': true }
    })}
    />
  );
  const ul = container.querySelector('ul');
  expect(ul.classList.contains('custom-class')).toBe(true);
  expect(ul.classList.contains('another-class')).toBe(true);
});

test('HistoryViewerVersionList handles array extraClass', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps({
      extraClass: ['custom-class', 'another-class']
    })}
    />
  );
  const ul = container.querySelector('ul');
  expect(ul.classList.contains('custom-class')).toBe(true);
  expect(ul.classList.contains('another-class')).toBe(true);
});

test('HistoryViewerVersionList does not mark inactive versions as active in compare mode', () => {
  const VersionComponent = jest.fn(() => <div />);
  const versionFrom = { version: 1, draft: false, published: true };
  const versionTo = { version: 3, draft: false, published: true };
  const versions = [
    versionFrom,
    { version: 2, draft: false, published: true },
    { version: 4, draft: false, published: true },
    versionTo,
  ];
  const compare = { versionFrom, versionTo };
  render(
    <HistoryViewerVersionList {...makeProps({
      versions,
      compare,
      VersionComponent,
    })}
    />
  );
  const calls = VersionComponent.mock.calls;
  expect(calls[1][0].isActive).toBe(false);
  expect(calls[2][0].isActive).toBe(false);
});

test('HistoryViewerVersionList renders main wrapper div with correct class', () => {
  const { container } = render(
    <HistoryViewerVersionList {...makeProps()} />
  );
  expect(container.querySelector('div.history-viewer__list')).not.toBeNull();
});
