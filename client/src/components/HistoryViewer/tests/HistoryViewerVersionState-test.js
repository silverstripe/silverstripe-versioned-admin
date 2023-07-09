/* global jest, test, describe, it, expect */

import React from 'react';
import { render } from '@testing-library/react';
import { Component as HistoryViewerVersionState } from '../HistoryViewerVersionState';

function makeProps(obj = {}) {
  return {
    BadgeComponent: ({ status, message }) => <div className="test-badge" data-status={status} data-message={message} />,
    ...obj
  };
}

test('HistoryViewerVersionState adds extra classes to the default class', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      extraClass: 'foobar',
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state.foobar')).not.toBeNull();
});

test('HistoryViewerVersionState returns the correct state', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        published: true
      },
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state').textContent).toContain('Published');
});

test('HistoryViewerVersionState returns the Unplublished state correctly', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        published: true,
        deleted: true,
      },
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state').textContent).toContain('Unpublished');
});

test('HistoryViewerVersionState returns the Archived state correctly', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        published: true,
        deleted: true,
        draft: true,
      },
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state').textContent).toContain('Archived');
});

test('HistoryViewerVersionState returns the Created state correctly', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        version: 1,
      },
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state').textContent).toContain('Created');
});

test('HistoryViewerVersionState defaults to "Modified" if not defined', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {},
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state').textContent).toContain('Saved');
});

test('HistoryViewerVersionState returns a formatted date', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        lastEdited: '2018-05-03 17:12:00'
      },
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state .text-muted').textContent).toBe('05/03/2018 5:12 PM');
});

test('HistoryViewerVersionState returns a badge when the version is live', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        liveVersion: true
      },
    })}
    />
  );
  const badge = container.querySelector('.test-badge');
  expect(badge.getAttribute('data-message')).toBe('Live');
  expect(badge.getAttribute('data-status')).toBe('success');
});

test('HistoryViewerVersionState doess not return a badge when the version is false', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        liveVersion: false
      },
    })}
    />
  );
  expect(container.querySelector('.test-badge')).toBeNull();
});
