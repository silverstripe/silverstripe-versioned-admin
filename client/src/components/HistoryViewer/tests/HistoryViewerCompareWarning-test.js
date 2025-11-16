/* global jest, test, expect */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component as HistoryViewerCompareWarning } from '../HistoryViewerCompareWarning';

jest.mock('i18n', () => ({
  _t: (key, defaultValue) => {
    const translations = {
      'HistoryViewer.COMPARE_MODE': 'Compare mode',
      'HistoryViewer.SELECT_PROMPT': 'Select two versions',
      'HistoryViewer.EXIT': 'Exit',
    };
    return translations[key] || defaultValue;
  },
}));

function makeProps(obj = {}) {
  return {
    isCompare: false,
    onDismissCompare: jest.fn(),
    ...obj
  };
}

test('HistoryViewerCompareWarning does not render when isCompare is false', () => {
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: false })} />
  );
  expect(container.firstChild).toBeNull();
});

test('HistoryViewerCompareWarning renders when isCompare is true', () => {
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  const notice = container.querySelector('.history-viewer__compare-notice');
  expect(notice).not.toBeNull();
  expect(notice.classList.contains('alert')).toBe(true);
  expect(notice.classList.contains('alert-info')).toBe(true);
});

test('HistoryViewerCompareWarning displays correct compare mode text', () => {
  render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  expect(screen.getByText((content) => content.includes('Compare mode'))).not.toBeNull();
  expect(screen.getByText('Select two versions')).not.toBeNull();
});

test('HistoryViewerCompareWarning displays message with strong tag', () => {
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  const strongElement = container.querySelector('.notice-message strong');
  expect(strongElement).not.toBeNull();
  expect(strongElement.textContent).toContain('Compare mode');
});

test('HistoryViewerCompareWarning renders dismiss button with correct classes', () => {
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  const dismissButton = container.querySelector('.dismiss-button');
  expect(dismissButton).not.toBeNull();
  expect(dismissButton.classList.contains('btn')).toBe(true);
});

test('HistoryViewerCompareWarning renders dismiss button with exit text', () => {
  render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  const exitButton = screen.getByRole('button');
  expect(exitButton.textContent).toContain('Exit');
});

test('HistoryViewerCompareWarning renders cancel icon with aria-hidden', () => {
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  const icon = container.querySelector('.font-icon-cancel');
  expect(icon).not.toBeNull();
  expect(icon.getAttribute('aria-hidden')).toBe('true');
});

test('HistoryViewerCompareWarning calls onDismissCompare when button is clicked', () => {
  const onDismissCompare = jest.fn();
  render(
    <HistoryViewerCompareWarning {...makeProps({
      isCompare: true,
      onDismissCompare,
    })}
    />
  );
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(onDismissCompare).toHaveBeenCalledTimes(1);
});

test('HistoryViewerCompareWarning button click does not call onDismissCompare when not in compare mode', () => {
  const onDismissCompare = jest.fn();
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({
      isCompare: false,
      onDismissCompare,
    })}
    />
  );
  const button = container.querySelector('button');
  expect(button).toBeNull();
  expect(onDismissCompare).not.toHaveBeenCalled();
});

test('HistoryViewerCompareWarning renders with correct DOM structure', () => {
  const { container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  const notice = container.querySelector('.history-viewer__compare-notice');
  const message = notice.querySelector('.notice-message');
  const button = notice.querySelector('.dismiss-button');
  expect(message).not.toBeNull();
  expect(button).not.toBeNull();
  expect(button.querySelector('.font-icon-cancel')).not.toBeNull();
});

test('HistoryViewerCompareWarning can switch between compare modes', () => {
  const { rerender, container } = render(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: false })} />
  );
  expect(container.firstChild).toBeNull();
  rerender(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: true })} />
  );
  expect(container.querySelector('.history-viewer__compare-notice')).not.toBeNull();
  rerender(
    <HistoryViewerCompareWarning {...makeProps({ isCompare: false })} />
  );
  expect(container.firstChild).toBeNull();
});

test('HistoryViewerCompareWarning multiple onDismissCompare calls', () => {
  const onDismissCompare = jest.fn();
  render(
    <HistoryViewerCompareWarning {...makeProps({
      isCompare: true,
      onDismissCompare,
    })}
    />
  );
  const button = screen.getByRole('button');
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.click(button);
  expect(onDismissCompare).toHaveBeenCalledTimes(3);
});
