/* eslint-disable import/no-extraneous-dependencies */
/* global jest, describe, it, expect */

import React from 'react';
import { Component as HistoryViewer } from '../HistoryViewer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16/build/index';

Enzyme.configure({ adapter: new Adapter() });

describe('HistoryViewer', () => {
  const ListComponent = () => <table />;
  const VersionDetailComponent = () => <div />;
  const CompareWarningComponent = () => <div />;

  // Mock select functions to replace the ones provided by mapDispatchToProps
  let mockOnSelect;
  let mockOnSetPage;

  beforeEach(() => {
    mockOnSelect = jest.fn();
    mockOnSetPage = jest.fn();
  });

  const versions = {
    versions: {
      pageInfo: {
        totalCount: 2
      },
      nodes: [
        {
          version: 14,
          author: {
            firstName: 'Michelle',
            surname: 'Masters'
          },
          publisher: null,
          published: false,
          latestDraftVersion: false,
          liveVersion: false,
          lastEdited: '2018-03-08 11:57:58'
        },
        {
          version: 13,
          author: {
            firstName: 'Scott',
            surname: 'Stockman'
          },
          publisher: null,
          published: false,
          latestDraftVersion: true,
          liveVersion: false,
          lastEdited: '2018-03-08 11:57:56'
        },
      ],
    },
  };

  describe('getVersions()', () => {
    it('returns the node element from each version edge', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          versions={versions}
          recordId={1}
          limit={100}
          compare={false}
        />
      );

      expect(wrapper.instance().getVersions().map((version) => version.version)).toEqual([14, 13]);
    });
  });

  describe('getLatestVersion()', () => {
    it('returns the version marked as LatestDraftVersion', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          versions={versions}
          recordId={1}
          limit={100}
          page={1}
          compare={false}
        />
      );

      expect(wrapper.instance().getLatestVersion().version).toEqual(13);
    });

    it('gives priority to the currentVersion', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          versions={versions}
          recordId={1}
          limit={100}
          page={1}
          compare={false}
          currentVersion={{
            version: 123,
            latestDraftVersion: true
          }}
        />
      );

      expect(wrapper.instance().getLatestVersion().version).toEqual(123);
    });
  });

  describe('render()', () => {
    it('shows a loading state while loading results', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          versions={versions}
          recordId={1}
          limit={100}
          loading
        />
      );

      const result = wrapper.find(
        'cms-content-loading-spinner'
      );

      expect(result).toBeTruthy();
    });
  });

  describe('handlePagination()', () => {
    it('should have called onSetPage and handlePrevPage after prev button in navigation clicked', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
          compare={false}
        />
    );
      wrapper.instance().handlePrevPage();
      expect(mockOnSetPage).toBeCalledWith(1);
    });
  });

  describe('onSelect()', () => {
    it('called when components unmounts', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
          compare={false}
        />
      );

      wrapper.instance().componentWillUnmount();
      expect(mockOnSelect).toBeCalled();
    });
  });

  describe('isListView()', () => {
    it('returns true when no current version or compare mode is set', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
          currentVersion={false}
          compare={false}
        />
      );

      expect(wrapper.instance().isListView()).toBe(true);
    });

    it('returns false current version is set and compare mode is not', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
          currentVersion={{
            ID: 1,
          }}
          compare={false}
        />
      );

      expect(wrapper.instance().isListView()).toBe(false);
    });

    it('returns true when current version is set with only compare FROM', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
          currentVersion={{
            id: 1,
          }}
          compare={{
            versionFrom: {
              id: 1,
            },
          }}
        />
      );

      expect(wrapper.instance().isListView()).toBe(true);
    });

    it('returns false when in compare mode', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
          currentVersion={{
            ID: 1
          }}
          compare={{
            versionFrom: {
              ID: 1,
            },
            versionTo: {
              ID: 2,
            },
          }}
        />
      );

      expect(wrapper.instance().isListView()).toBe(false);
    });
  });

  describe('compareModeAvailable()', () => {
    it('returns true when more than one version is present', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={versions}
        />
      );

      expect(wrapper.instance().compareModeAvailable()).toBe(true);
    });

    it('returns false with only one version', () => {
      const wrapper = shallow(
        <HistoryViewer
          ListComponent={ListComponent}
          VersionDetailComponent={VersionDetailComponent}
          CompareWarningComponent={CompareWarningComponent}
          recordId={1}
          onSelect={mockOnSelect}
          onSetPage={mockOnSetPage}
          limit={1}
          page={2}
          versions={{
            versions: {
              pageInfo: { totalCount: 1 },
              nodes: [
                { version: 14 },
              ],
            }
          }}
        />
      );

      expect(wrapper.instance().compareModeAvailable()).toBe(false);
    });
  });
});
