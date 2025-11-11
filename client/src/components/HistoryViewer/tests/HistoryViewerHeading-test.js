/* eslint-disable import/no-extraneous-dependencies */
/* global jest, test, expect, beforeEach, afterEach */

import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Component as HistoryViewerHeading } from '../HistoryViewerHeading';

// eslint-disable-next-line no-console
const originalError = console.error;

// Suppress Popper warnings in tests
jest.spyOn(console, 'error').mockImplementation((...args) => {
  const message = args[0]?.toString?.() || '';
  if (!message.includes('Popper') && !message.includes('An update to')) {
    originalError(...args);
  }
});

function makeProps(obj = {}) {
  return {
    compareModeAvailable: true,
    compareModeSelected: false,
    onCompareModeSelect: jest.fn(),
    onCompareModeUnselect: jest.fn(),
    ...obj
  };
}

test('HistoryViewerHeading triggers mapDispatchToProps functions to notify and update the Redux store', () => {
  const onCompareModeUnselect = jest.fn();
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeSelected: true,
      onCompareModeUnselect
    })}
    />
  );
  act(() => {
    fireEvent.click(container.querySelector('.history-viewer-heading__compare-mode-checkbox'));
  });
  expect(onCompareModeUnselect).toHaveBeenCalled();
});

test('HistoryViewerHeading simulates change event in disabled compare mode', () => {
  const onCompareModeSelect = jest.fn();
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeSelected: false,
      onCompareModeSelect
    })}
    />
  );
  act(() => {
    fireEvent.click(container.querySelector('.history-viewer-heading__compare-mode-checkbox'));
  });
  expect(onCompareModeSelect).toHaveBeenCalled();
});

test('HistoryViewerHeading renders header structure with correct roles and text', () => {
  const { container } = render(<HistoryViewerHeading {...makeProps()} />);
  const heading = container.querySelector('.history-viewer__heading');
  expect(heading.getAttribute('role')).toBe('row');
  expect(container.querySelector('.history-viewer__version-no').getAttribute('role')).toBe('columnheader');
  expect(container.querySelector('.history-viewer__version-state').getAttribute('role')).toBe('columnheader');
  expect(container.querySelector('.history-viewer__author').getAttribute('role')).toBe('columnheader');
  expect(container.querySelector('.history-viewer__actions').getAttribute('role')).toBe('columnheader');
  expect(screen.getByText('Record')).not.toBeNull();
  expect(screen.getByText('Author')).not.toBeNull();
});

test('HistoryViewerHeading does not render dropdown when compare mode is not available', () => {
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeAvailable: false
    })}
    />
  );
  expect(container.querySelector('.history-viewer__actions-dropdown')).toBeNull();
  expect(container.querySelector('.history-viewer-heading__compare-mode-checkbox')).toBeNull();
});

test('HistoryViewerHeading renders dropdown toggle button when compare mode is available', () => {
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeAvailable: true
    })}
    />
  );
  const dropdown = container.querySelector('.history-viewer__actions-dropdown');
  expect(dropdown).not.toBeNull();
  const toggleButton = container.querySelector('.btn--no-text');
  expect(toggleButton).not.toBeNull();
  expect(toggleButton.getAttribute('title')).toBe('Compare mode');
  expect(toggleButton.getAttribute('aria-label')).toBe('Compare mode');
  expect(container.querySelector('.font-icon-sliders')).not.toBeNull();
});

test('HistoryViewerHeading toggles dropdown visibility when toggle button is clicked', () => {
  const { container } = render(<HistoryViewerHeading {...makeProps()} />);
  const toggleButton = container.querySelector('.btn--no-text');
  const dropdownMenu = container.querySelector('.dropdown-menu');
  expect(dropdownMenu).not.toBeNull();
  act(() => {
    fireEvent.click(toggleButton);
  });
  expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
});

test('HistoryViewerHeading closes dropdown when Escape key is pressed', () => {
  const { container } = render(<HistoryViewerHeading {...makeProps()} />);
  const toggleButton = container.querySelector('.btn--no-text');
  const checkbox = container.querySelector('.history-viewer-heading__compare-mode-checkbox');
  act(() => {
    fireEvent.click(toggleButton);
    fireEvent.keyDown(checkbox, { key: 'Escape' });
    fireEvent.click(toggleButton);
  });
});

test('HistoryViewerHeading checkbox renders with correct state when compare mode is selected', () => {
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeSelected: true
    })}
    />
  );
  const checkbox = container.querySelector('.history-viewer-heading__compare-mode-checkbox');
  expect(checkbox.checked).toBe(true);
});

test('HistoryViewerHeading checkbox renders with correct state when compare mode is not selected', () => {
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeSelected: false
    })}
    />
  );
  const checkbox = container.querySelector('.history-viewer-heading__compare-mode-checkbox');
  expect(checkbox.checked).toBe(false);
});

test('HistoryViewerHeading checkbox has correct accessibility attributes', () => {
  const { container } = render(<HistoryViewerHeading {...makeProps()} />);
  const checkbox = container.querySelector('.history-viewer-heading__compare-mode-checkbox');
  expect(checkbox.getAttribute('id')).toBe('history-viewer-compare-two');
  expect(checkbox.getAttribute('type')).toBe('checkbox');
  expect(checkbox.classList.contains('no-change-track')).toBe(true);
  const label = container.querySelector('label[for="history-viewer-compare-two"]');
  expect(label).not.toBeNull();
  expect(label.textContent).toBe('Compare two versions');
});

test('HistoryViewerHeading calls onCompareModeSelect when checkbox is toggled from unchecked to checked', () => {
  const onCompareModeSelect = jest.fn();
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeSelected: false,
      onCompareModeSelect
    })}
    />
  );
  const checkbox = container.querySelector('.history-viewer-heading__compare-mode-checkbox');
  act(() => {
    fireEvent.click(checkbox);
  });
  expect(onCompareModeSelect).toHaveBeenCalledTimes(1);
});

test('HistoryViewerHeading calls onCompareModeUnselect when checkbox is toggled from checked to unchecked', () => {
  const onCompareModeUnselect = jest.fn();
  const { container } = render(
    <HistoryViewerHeading {...makeProps({
      compareModeSelected: true,
      onCompareModeUnselect
    })}
    />
  );
  const checkbox = container.querySelector('.history-viewer-heading__compare-mode-checkbox');
  act(() => {
    fireEvent.click(checkbox);
  });
  expect(onCompareModeUnselect).toHaveBeenCalledTimes(1);
});

test('HistoryViewerHeading respects default props', () => {
  const { container } = render(<HistoryViewerHeading {...makeProps({
    compareModeAvailable: undefined
  })}
  />);
  expect(container.querySelector('.history-viewer__actions-dropdown')).not.toBeNull();
});
