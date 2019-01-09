/* eslint-disable import/no-extraneous-dependencies */
/* global jest, describe, it, expect */

import React from 'react';
import { Component as HistoryViewerHeading } from '../HistoryViewerHeading';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16/build/index';

Enzyme.configure({ adapter: new Adapter() });

describe('HistoryViewerHeading', () => {
  // Mock select functions to replace the ones provided by mapDispatchToProps
  const mockOnCompareModeSelect = jest.fn();
  const mockOnCompareModeUnselect = jest.fn();

  describe('onChange()', () => {
    it('triggers mapDispatchToProps functions to notify and update the Redux store', () => {
      const wrapper = shallow(
        <HistoryViewerHeading
          compareModeSelected
          onCompareModeSelect={mockOnCompareModeSelect}
          onCompareModeUnselect={mockOnCompareModeUnselect}
        />
      );

      wrapper.find('.history-viewer-heading__compare-mode-checkbox').at(0).simulate('change');
      expect(mockOnCompareModeUnselect).toHaveBeenCalled();
    });

    it('simulate change event in disabled compare mode', () => {
      const wrapper = shallow(
        <HistoryViewerHeading
          compareModeSelected={false}
          onCompareModeSelect={mockOnCompareModeSelect}
          onCompareModeUnselect={mockOnCompareModeUnselect}
        />
      );

      wrapper.find('.history-viewer-heading__compare-mode-checkbox').at(0).simulate('change');
      expect(mockOnCompareModeSelect).toHaveBeenCalled();
    });
  });
});

