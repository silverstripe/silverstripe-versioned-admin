/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Component as HistoryViewer } from '../HistoryViewer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from "enzyme-adapter-react-15.4/build/index";

Enzyme.configure({ adapter: new Adapter() });

describe('HistoryViewer', () => {
  let component = null;
  const ListComponent = () => <table />;
  const VersionDetailComponent = () => <div />;

  const versions = {
    Versions: {
      pageInfo: {
        totalCount: 2
      },
      edges: [
        {
          node: {
            Version: 14,
            Author: {
              FirstName: 'Michelle',
              Surname: 'Masters'
            },
            Publisher: null,
            Published: false,
            LatestDraftVersion: true,
            LiveVersion: false,
            LastEdited: '2018-03-08 11:57:58'
          }
        },
        {
          node: {
            Version: 13,
            Author: {
              FirstName: 'Scott',
              Surname: 'Stockman'
            },
            Publisher: null,
            Published: false,
            LatestDraftVersion: false,
            LiveVersion: false,
            LastEdited: '2018-03-08 11:57:56'
          }
        },
      ],
    },
  };

  describe('getVersions()', () => {
    it('returns the node element from each version edge', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          versions={versions}
          recordId={1}
          limit={100}
        />
      );

      expect(component.getVersions().map((version) => version.Version)).toEqual([14, 13]);
    });
  });

  describe('getLatestVersion()', () => {
    it('returns the latest version from page one', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          versions={versions}
          recordId={1}
          limit={100}
          page={1}
        />
      );
      expect(component.getLatestVersion().Version).toEqual(14);
    });

    it('returns null if we are not on page one', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          versions={versions}
          recordId={1}
          limit={100}
          page={2}
        />
      );
    expect(component.getLatestVersion()).toEqual(false);
    });
  });

  describe('render()', () => {
    it('shows a loading state while loading results', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          versions={versions}
          recordId={1}
          limit={100}
          loading
        />
      );

      const result = ReactTestUtils.findRenderedDOMComponentWithClass(
        component,
        'cms-content-loading-spinner'
      );

      expect(result).toBeTruthy();
    });
  });
});
