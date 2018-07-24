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
  let version = {};

  beforeEach(() => {
    mockOnCompare = jest.fn();
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
  });
});
