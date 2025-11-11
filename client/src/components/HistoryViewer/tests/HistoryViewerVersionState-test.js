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

test('HistoryViewerVersionState renders with role="cell"', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps()} />
  );
  expect(container.querySelector('[role="cell"]')).not.toBeNull();
});

test('HistoryViewerVersionState renders badge with inverted style when isActive is true', () => {
  const BadgeComponentWithInverted = ({ status, message, inverted }) => (
    <div className="test-badge" data-status={status} data-message={message} data-inverted={inverted} />
  );
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      isActive: true,
      version: {
        liveVersion: true
      },
      BadgeComponent: BadgeComponentWithInverted,
    })}
    />
  );
  const badge = container.querySelector('.test-badge');
  expect(badge.getAttribute('data-inverted')).toBe('true');
});

test('HistoryViewerVersionState renders badge without inverted style when isActive is false', () => {
  const BadgeComponentWithInverted = ({ status, message, inverted }) => (
    <div className="test-badge" data-status={status} data-message={message} data-inverted={inverted} />
  );
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      isActive: false,
      version: {
        liveVersion: true
      },
      BadgeComponent: BadgeComponentWithInverted,
    })}
    />
  );
  const badge = container.querySelector('.test-badge');
  expect(badge.getAttribute('data-inverted')).toBe('false');
});

test('HistoryViewerVersionState displays date in muted text', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        lastEdited: '2018-05-03 17:12:00'
      },
    })}
    />
  );
  const mutedText = container.querySelector('.text-muted');
  expect(mutedText).not.toBeNull();
  expect(mutedText.textContent).toBe('05/03/2018 5:12 PM');
});

test('HistoryViewerVersionState has correct DOM structure', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        version: 1,
        lastEdited: '2018-05-03 17:12:00'
      },
    })}
    />
  );
  const rootElement = container.querySelector('.history-viewer__version-state');
  expect(rootElement).not.toBeNull();
  expect(rootElement.getAttribute('role')).toBe('cell');
  expect(rootElement.children.length).toBeGreaterThan(0);
});

test('HistoryViewerVersionState renders state and date in correct order', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        published: true,
        lastEdited: '2018-05-03 17:12:00'
      },
    })}
    />
  );
  const rootElement = container.querySelector('.history-viewer__version-state');
  const textContent = rootElement.textContent;
  expect(textContent).toContain('Published');
  expect(textContent).toContain('05/03/2018 5:12 PM');
  const publishedIndex = textContent.indexOf('Published');
  const dateIndex = textContent.indexOf('05/03/2018');
  expect(publishedIndex).toBeLessThan(dateIndex);
});

test('HistoryViewerVersionState returns Saved state for published=false with no deletion', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        published: false,
        deleted: false,
      },
    })}
    />
  );
  expect(container.querySelector('.history-viewer__version-state').textContent).toContain('Saved');
});

test('HistoryViewerVersionState handles version with both publisher and author data', () => {
  const { container } = render(
    <HistoryViewerVersionState {...makeProps({
      version: {
        published: true,
        lastEdited: '2020-01-15 10:30:00',
        publisher: {
          firstName: 'John',
          surname: 'Doe'
        },
        author: {
          firstName: 'Jane',
          surname: 'Smith'
        }
      },
    })}
    />
  );
  const rootElement = container.querySelector('.history-viewer__version-state');
  expect(rootElement).not.toBeNull();
  expect(rootElement.textContent).toContain('Published');
});
