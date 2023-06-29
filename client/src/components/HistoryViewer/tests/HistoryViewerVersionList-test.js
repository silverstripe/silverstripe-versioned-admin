/* global jest, test, describe, it, expect */

import React from 'react';
import { render } from '@testing-library/react';
import { Component as HistoryViewerVersionList } from '../HistoryViewerVersionList';

test('HistoryViewerVersionList returns an unordered list', () => {
  const { container } = render(
    <HistoryViewerVersionList {...{
      FormAlertComponent: () => <div />,
      HeadingComponent: () => <li />,
      VersionComponent: () => <div />,
      versions: [],
    }}
    />
  );
  expect(container.querySelector('ul.history-viewer__table')).not.toBeNull();
});
