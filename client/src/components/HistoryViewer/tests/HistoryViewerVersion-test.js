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

test('HistoryViewerVersion does not render compare button when compareModeAvailable is false', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      compareModeAvailable: false,
      isActive: false,
    })}
    />
  );
  expect(container.querySelectorAll('[data-extraclass="history-viewer__compare-button"')).toHaveLength(0);
});

test('HistoryViewerVersion does not render compare button when compare mode is already active', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      compareModeAvailable: true,
      compare: {
        versionFrom: { Version: 1 },
      },
      isActive: false,
    })}
    />
  );
  expect(container.querySelectorAll('[data-extraclass="history-viewer__compare-button"')).toHaveLength(0);
});

test('HistoryViewerVersion does not render clear button or selected message when not active', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      isActive: false,
    })}
    />
  );
  expect(screen.queryByText('Already selected')).toBeNull();
  expect(container.querySelectorAll('[data-extraclass="history-viewer__close-button"')).toHaveLength(0);
});

test('HistoryViewerVersion renders empty actions cell when not active and not in compare mode', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      isActive: false,
      compare: false,
    })}
    />
  );
  const actions = container.querySelectorAll('.history-viewer__actions');
  expect(actions).toHaveLength(1);
  expect(actions[0].children.length).toBe(0);
});

test('HistoryViewerVersion getAuthor() returns empty string when member has no name', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      version: {
        ...makeProps().version,
        author: {
          firstName: '',
          surname: '',
        },
      },
    })}
    />
  );
  await screen.findByText('Already selected');
  expect(container.querySelector('.history-viewer__author').textContent).toBe(' ');
});

test('HistoryViewerVersion getAuthor() returns only firstName when surname is missing', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      version: {
        ...makeProps().version,
        author: {
          firstName: 'Jane',
          surname: '',
        },
      },
    })}
    />
  );
  await screen.findByText('Already selected');
  expect(container.querySelector('.history-viewer__author').textContent).toBe('Jane ');
});

test('HistoryViewerVersion calls handleKeyUp when Enter key is pressed', async () => {
  const onSelect = jest.fn();
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      isActive: false,
    })}
    />
  );
  const link = container.querySelector('.history-viewer__version-link');
  fireEvent.keyUp(link, { key: 'Enter' });
  expect(onSelect).toBeCalledWith(makeProps().version, false);
});

test('HistoryViewerVersion does not call handleClick when non-Enter key is pressed', async () => {
  const onSelect = jest.fn();
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      isActive: false,
    })}
    />
  );
  const link = container.querySelector('.history-viewer__version-link');
  fireEvent.keyUp(link, { key: ' ' });
  expect(onSelect).not.toBeCalled();
});

test('HistoryViewerVersion renders version number correctly', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps()}/>
  );
  expect(container.querySelector('.history-viewer__version-no').textContent).toBe('3');
});

test('HistoryViewerVersion applies correct className when isActive is true', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      isActive: true,
    })}
    />
  );
  const row = container.querySelector('.history-viewer__row');
  expect(row.classList.contains('history-viewer__row--current')).toBe(true);
});

test('HistoryViewerVersion does not apply current className when isActive is false', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      isActive: false,
    })}
    />
  );
  const row = container.querySelector('.history-viewer__row');
  expect(row.classList.contains('history-viewer__row--current')).toBe(false);
});

test('HistoryViewerVersion applies comparison-selected className when in compare mode but selections incomplete', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      compare: {
        versionFrom: { Version: 1 },
      },
      isActive: false,
    })}
    />
  );
  const row = container.querySelector('.history-viewer__row');
  expect(row.classList.contains('history-viewer__row--comparison-selected')).toBe(true);
});

test('HistoryViewerVersion applies comparison-selected className when in compare mode with versionFrom and versionTo', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      compare: {
        versionFrom: { Version: 1 },
        versionTo: { Version: 2 },
      },
      isActive: false,
    })}
    />
  );
  const row = container.querySelector('.history-viewer__row');
  expect(row.classList.contains('history-viewer__row--comparison-selected')).toBe(true);
});

test('HistoryViewerVersion applies extraClass when provided as string', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      extraClass: 'custom-extra-class',
    })}
    />
  );
  const row = container.querySelector('.history-viewer__row');
  expect(row.classList.contains('custom-extra-class')).toBe(true);
});

test('HistoryViewerVersion applies extraClass when provided as object', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      extraClass: {
        'custom-class-1': true,
        'custom-class-2': false,
      },
    })}
    />
  );
  const row = container.querySelector('.history-viewer__row');
  expect(row.classList.contains('custom-class-1')).toBe(true);
  expect(row.classList.contains('custom-class-2')).toBe(false);
});

test('HistoryViewerVersion renders StateComponent with correct props', async () => {
  const StateComponent = jest.fn(() => <div data-testid="custom-state" />);
  render(
    <HistoryViewerVersion {...makeProps({
      StateComponent,
    })}
    />
  );
  expect(screen.getByTestId('custom-state')).not.toBeNull();
});

test('HistoryViewerVersion renders list item with role row', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps()}/>
  );
  const listItem = container.querySelector('li[role="row"]');
  expect(listItem).not.toBeNull();
  expect(listItem.classList.contains('history-viewer__row')).toBe(true);
});

test('HistoryViewerVersion renders version link with button role and correct tabIndex', async () => {
  const { container } = render(
    <HistoryViewerVersion {...makeProps()}/>
  );
  const link = container.querySelector('[role="button"]');
  expect(link).not.toBeNull();
  expect(link.getAttribute('tabIndex')).toBe('0');
});

test('HistoryViewerVersion passes correct version prop to onSelect when compare object provided', async () => {
  const onSelect = jest.fn();
  const compareObj = {
    versionFrom: { Version: 1 },
  };
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      isActive: false,
      compare: compareObj,
    })}
    />
  );
  fireEvent.click(container.querySelector('.history-viewer__version-link'));
  expect(onSelect).toBeCalledWith(makeProps().version, compareObj);
});

test('HistoryViewerVersion handleClose passes correct arguments to onSelect', async () => {
  const onSelect = jest.fn();
  const compareObj = {
    versionFrom: { Version: 3 },
  };
  const { container } = render(
    <HistoryViewerVersion {...makeProps({
      onSelect,
      compare: compareObj,
    })}
    />
  );
  await screen.findByText('Already selected');
  fireEvent.click(container.querySelector('[data-extraclass="history-viewer__close-button"'));
  expect(onSelect).toHaveBeenCalledWith(0, compareObj);
});
