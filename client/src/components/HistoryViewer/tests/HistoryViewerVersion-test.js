/* eslint-disable import/no-extraneous-dependencies */
/* global jest, describe, it, expect */

import React from 'react';
import { Component as HistoryViewerVersion } from '../HistoryViewerVersion';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15.4/build/index';

Enzyme.configure({ adapter: new Adapter() });

describe('HistoryViewerVersion', () => {
  const StateComponent = () => <div />;
  const FormActionComponent = () => <div />;

  let mockOnCompare;
  let mockOnCompareSelect;
  let mockOnSelect;
  let version = {};

  beforeEach(() => {
    mockOnCompare = jest.fn();
    mockOnCompareSelect = jest.fn();
    mockOnSelect = jest.fn();

    version = {
      Version: 3,
      Published: false,
      Author: {
        FirstName: 'John',
        Surname: 'Smith',
      },
      Publisher: {
        FirstName: 'Sarah',
        Surname: 'Smith',
      },
    };
  });

  describe('HistoryViewerVersion', () => {
    it('calls onCompare to dispatch an action as the result of handleCompare call', () => {
      const wrapper = shallow(
        <HistoryViewerVersion
          version={version}
          onCompare={mockOnCompare}
          StateComponent={StateComponent}
          FormActionComponent={FormActionComponent}
        />
      );

      wrapper.instance().handleCompare();
      expect(mockOnCompare).toBeCalledWith(3);
    });
    it('returns the author name when unpublished', () => {
      const wrapper = shallow(
        <HistoryViewerVersion
          version={version}
          StateComponent={StateComponent}
          FormActionComponent={FormActionComponent}
        />
      );

      expect(wrapper.instance().getAuthor()).toEqual('John Smith');
    });

    it('returns the publisher name when published', () => {
      const wrapper = shallow(
        <HistoryViewerVersion
          version={{
            ...version,
            Published: true
          }}
          StateComponent={StateComponent}
          FormActionComponent={FormActionComponent}
        />
      );

      expect(wrapper.instance().getAuthor()).toEqual('Sarah Smith');
    });

    describe('handleClick()', () => {
      it('does nothing on row click when the clear button is shown', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            isActive
          />
        );

        wrapper.simulate('click');
        expect(mockOnCompareSelect).not.toHaveBeenCalled();
        expect(mockOnSelect).not.toHaveBeenCalled();
      });

      it('renders version details when version clicked', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
          />
        );

        wrapper.instance().handleClick();
        expect(mockOnCompareSelect).not.toHaveBeenCalled();
        expect(mockOnSelect).toHaveBeenCalledWith(version.Version);
      });


      it('renders the close button in the version details', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
            isActive
          />
        );

        expect(wrapper.find(FormActionComponent).at(1).props().extraClass).toEqual('history-viewer__close-button');
      });

      it('renders the compare button in the version details', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
            isActive
          />
        );

        expect(wrapper.find(FormActionComponent).at(0).props().extraClass).toEqual('history-viewer__compare-button');
      });

      it('chooses version when version clicked in compare mode', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
            onCompareSelect={mockOnCompareSelect}
            compare={{
              versionFrom: 0, versionTo: 0
            }}
          />
        );

        wrapper.instance().handleClick();
        expect(mockOnCompareSelect).toHaveBeenCalled();
        expect(mockOnSelect).not.toHaveBeenCalled();
      });
    });

    describe('handleClose()', () => {
      it('return back to list view when closing version via action dispatch', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
            isActive
          />
        );

        wrapper.instance().handleClose();
        expect(mockOnCompareSelect).not.toHaveBeenCalled();
        expect(mockOnSelect).toHaveBeenCalled();
      });

      it('deselect version when closing version in compare mode', () => {
        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
            onCompareSelect={mockOnCompareSelect}
            isActive
            compare={{
              versionFrom: 0, versionTo: 0
            }}
          />
        );

        wrapper.instance().handleClose();
        expect(mockOnCompareSelect).toHaveBeenCalled();
        expect(mockOnSelect).not.toHaveBeenCalled();
      });
    });
  });
});
