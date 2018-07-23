/* eslint-disable import/no-extraneous-dependencies */
/* global jest, describe, it, expect */

import React from 'react';
import { Component as HistoryViewerHeading } from '../HistoryViewerHeading';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15.4/build/index';

Enzyme.configure({ adapter: new Adapter() });

describe('HistoryViewerHeading', () => {
  // Mock select functions to replace the ones provided by mapDispatchToProps
  const mockOnCompareModeSelect = jest.fn();
  const mockOnCompareModeUnselect = jest.fn();

  describe('onChange function triggers mapDispatchToProps functions to notify and update the Redux store', () => {
    describe('simulate change event in enabled compare mode', () => {
      const wrapper = shallow(
        <HistoryViewerHeading
          compareModeSelected
          onCompareModeSelect={mockOnCompareModeSelect}
          onCompareModeUnselect={mockOnCompareModeUnselect}
        />
      );

      it('should dispatch an action to disable the compare mode', () => {
        wrapper.find('.history-viewer-heading__compare-mode-checkbox').at(0).simulate('change');
        expect(mockOnCompareModeUnselect).toHaveBeenCalled();
      });
    });

    describe('simulate change event in disabled compare mode', () => {
      const wrapper = shallow(
        <HistoryViewerHeading
          compareModeSelected={false}
          onCompareModeSelect={mockOnCompareModeSelect}
          onCompareModeUnselect={mockOnCompareModeUnselect}
        />
      );

      it('should dispatch an action to enable the compare mode', () => {
        wrapper.find('.history-viewer-heading__compare-mode-checkbox').at(0).simulate('change');
        expect(mockOnCompareModeSelect).toHaveBeenCalled();
      });
    });
  });
});

