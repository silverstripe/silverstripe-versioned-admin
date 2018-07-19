/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
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
          hasActions={false}
          compareModeSelected={true}
          onCompareModeSelect={mockOnCompareModeSelect}
          onCompareModeUnselect={mockOnCompareModeUnselect}
        />
      );

      it('should dispatch an action to disable the compare mode', () => {
        wrapper.find('.compare-mode__checkbox').at(0).simulate('change');
        expect(mockOnCompareModeUnselect).toHaveBeenCalled();
      });
    });

    describe('simulate change event in disabled compare mode', () => {
      const wrapper = shallow(
        <HistoryViewerHeading
          hasActions={false}
          compareModeSelected={false}
          onCompareModeSelect={mockOnCompareModeSelect}
          onCompareModeUnselect={mockOnCompareModeUnselect}
        />
      );

      it('should dispatch an action to enable the compare mode', () => {
        wrapper.find('.compare-mode__checkbox').at(0).simulate('change');
        expect(mockOnCompareModeSelect).toHaveBeenCalled();
      });
    });
  });


  class HeadingWrapper extends React.PureComponent {
    render() {
      return (
        <table>
          <thead>
            <HistoryViewerHeading {...this.props} />
          </thead>
        </table>
      );
    }
  }

  it('has four columns when hasActions is true', () => {
    const component = ReactTestUtils.renderIntoDocument(
      <HeadingWrapper hasActions />
    );

    const result = ReactTestUtils.scryRenderedDOMComponentsWithTag(
      component,
      'th'
    );

    expect(result.length).toBe(4);
  });
});

