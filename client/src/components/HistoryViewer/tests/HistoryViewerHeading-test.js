/* eslint-disable import/no-extraneous-dependencies */
/* global jest, test, describe, it, expect */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Component as HistoryViewerHeading } from '../HistoryViewerHeading';

test('HistoryViewerHeading triggers mapDispatchToProps functions to notify and update the Redux store', () => {
  const onCompareModeUnselect = jest.fn();
  const { container } = render(
    <HistoryViewerHeading {...{
      compareModeSelected: true,
      onCompareModeUnselect
    }}
    />
  );
  fireEvent.click(container.querySelector('.history-viewer-heading__compare-mode-checkbox'));
  expect(onCompareModeUnselect).toHaveBeenCalled();
});

test('HistoryViewerHeading simulates change event in disabled compare mode', () => {
  const onCompareModeSelect = jest.fn();
  const { container } = render(
    <HistoryViewerHeading {...{
      compareModeSelected: false,
      onCompareModeSelect
    }}
    />
  );
  fireEvent.click(container.querySelector('.history-viewer-heading__compare-mode-checkbox'));
  expect(onCompareModeSelect).toHaveBeenCalled();
});
