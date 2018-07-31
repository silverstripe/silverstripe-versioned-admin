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

  let mockOnCompareMode;
  let mockOnCompareSelect;
  let mockOnSelect;
  let version = {};

  beforeEach(() => {
    mockOnCompareMode = jest.fn();
    mockOnCompareSelect = jest.fn();
    mockOnSelect = jest.fn();

    version = {
      Author: {
        FirstName: 'John',
        Surname: 'Smith',
      },
      Published: false,
      Publisher: {
        FirstName: 'Sarah',
        Surname: 'Smith',
      },
      Version: 3,
    };
  });

  describe('HistoryViewerVersion', () => {
    it('calls onCompareMode to dispatch an action as the result of handleCompare call', () => {
      const wrapper = shallow(
        <HistoryViewerVersion
          version={version}
          onCompareMode={mockOnCompareMode}
          StateComponent={StateComponent}
          FormActionComponent={FormActionComponent}
        />
      );

      wrapper.instance().handleCompare();
      expect(mockOnCompareMode).toBeCalledWith(version);
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
            isActive={false}
            compare={false}
          />
        );

        wrapper.instance().handleClick();
        expect(mockOnCompareSelect).not.toHaveBeenCalled();
        expect(mockOnSelect).toHaveBeenCalledWith(version, false);
      });

      it('renders version details when version clicked', () => {
        const compare = {
          versionFrom: 0,
          versionTo: 0
        };

        const wrapper = shallow(
          <HistoryViewerVersion
            version={version}
            StateComponent={StateComponent}
            FormActionComponent={FormActionComponent}
            onSelect={mockOnSelect}
            isActive={false}
            compare={compare}
          />
        );

        wrapper.instance().handleClick();
        expect(mockOnCompareSelect).not.toHaveBeenCalled();
        expect(mockOnSelect).toHaveBeenCalledWith(version, compare);
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
        expect(mockOnSelect).toHaveBeenCalled();
        expect(mockOnCompareMode).not.toHaveBeenCalled();
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
            compare={false}
          />
        );

        wrapper.instance().handleClose();
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
        expect(mockOnSelect).toHaveBeenCalled();
        expect(mockOnCompareMode).not.toHaveBeenCalled();
      });
    });
  });
});
