/* eslint-disable import/no-extraneous-dependencies */
/* global jest, test, describe, it, expect */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component as HistoryViewerVersion } from '../HistoryViewerVersion';

function makeProps(obj = {}) {
  return {
    version: {
      author: {
        firstName: 'John',
        surname: 'Smith',
      },
      published: false,
      publisher: {
        firstName: 'Sarah',
        surname: 'Smith',
      },
      version: 3,
    },
    isActive: true,
    onSelect: () => null,
    StateComponent: () => <div data-testid="test-state" />,
    FormActionComponent: ({ onClick, extraClass }) => <div data-testid="test-form-action" onClick={onClick} data-extraclass={extraClass} />,
    ...obj
  };
}

test('HistoryViewerVersion calls onCompareMode to dispatch an action as the result of handleCompare call', async () => {
  const onCompareMode = jest.fn();
  render(
    <HistoryViewerVersion {...makeProps({
      onCompareMode,
      compare: false,
    })}
    />
  );
  const actions = await screen.findAllByTestId('test-form-action');
  fireEvent.click(actions[0]);
  expect(onCompareMode).toBeCalledWith(makeProps().version);
});

test('HistoryViewerVersion getAuthor() returns the author name when unpublished', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps()}/>
  );
  await screen.findByText('Already selected');
  expect(container.querySelector('.history-viewer__author').textContent).toBe('John Smith');
});

test('HistoryViewerVersion getAuthor() returns the publisher name when published', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      version: {
        ...makeProps().version,
        published: true
      }
    })}
    />
  );
  await screen.findByText('Already selected');
  expect(container.querySelector('.history-viewer__author').textContent).toBe('Sarah Smith');
});

test('HistoryViewerVersion handleClick() does nothing on row click when the clear button is shown', async () => {
  const onSelect = jest.fn();
  const onCompareMode = jest.fn();
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      onCompareMode,
    })}
    />
  );
  await screen.findByText('Already selected');
  fireEvent.click(container.querySelector('.history-viewer__row'));
  expect(onSelect).not.toBeCalled();
  expect(onCompareMode).not.toBeCalled();
});

test('HistoryViewerVersion handleClick() renders version details when version clicked', async () => {
  const onSelect = jest.fn();
  const onCompareMode = jest.fn();
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      onCompareMode,
      isActive: false
    })}
    />
  );
  await screen.findByText('John Smith');
  fireEvent.click(container.querySelector('.history-viewer__version-link'));
  expect(onSelect).toBeCalledWith(makeProps().version, false);
  expect(onCompareMode).not.toBeCalled();
});

test('HistoryViewerVersion handleClick() renders version details when version clicked', async () => {
  // Note: handleClick is only fired when isActive is false
  const onSelect = jest.fn();
  const onCompareMode = jest.fn();
  const compare = {
    versionFrom: { Version: 0 },
    versionTo: { Version: 0 },
  };
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      onCompareMode,
      isActive: false,
      compare,
    })}
    />
  );
  await screen.findByText('John Smith');
  fireEvent.click(container.querySelector('.history-viewer__version-link'));
  expect(onSelect).toBeCalledWith(makeProps().version, compare);
  expect(onCompareMode).not.toBeCalled();
});

test('HistoryViewerVersion render() renders the close button in the version details', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps()}/>
  );
  await screen.findByText('Already selected');
  expect(container.querySelectorAll('[data-extraclass="history-viewer__close-button"')).toHaveLength(1);
});

test('HistoryViewerVersion render() renders the close button in the version details', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps()}/>
  );
  await screen.findByText('Already selected');
  expect(container.querySelectorAll('[data-extraclass="history-viewer__compare-button"')).toHaveLength(1);
});

test('HistoryViewerVersion handleClose() return back to list view when closing version via action dispatch', async () => {
  const onSelect = jest.fn();
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect
    })}
    />
  );
  await screen.findByText('Already selected');
  fireEvent.click(container.querySelector('[data-extraclass="history-viewer__close-button"'));
  expect(onSelect).toBeCalled();
});

test('HistoryViewerVersion handleClose() deselect version when closing version in compare mode', async () => {
  const onSelect = jest.fn();
  const onCompareMode = jest.fn();
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      onCompareMode,
      compare: {
        versionFrom: { Version: 0 },
        versionTo: { Version: 0 },
      },
    })}
    />
  );
  await screen.findByText('Already selected');
  fireEvent.click(container.querySelector('[data-extraclass="history-viewer__close-button"'));
  expect(onSelect).toBeCalled();
  expect(onCompareMode).not.toBeCalled();
});
