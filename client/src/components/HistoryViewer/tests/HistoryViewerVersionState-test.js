/* global jest, describe, it, expect */

import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Component as HistoryViewerVersionState } from '../HistoryViewerVersionState';

describe('HistoryViewerVersionState', () => {
  let component = null;
  HistoryViewerVersionState.defaultProps.BadgeComponent = () => <div />;

  describe('getClassNames()', () => {
    it('adds extra classes to the default class', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerVersionState extraClass="foobar" />
      );

      expect(component.getClassNames()).toContain('foobar');
      expect(component.getClassNames()).toContain('history-viewer__version-state');
    });
  });

  describe('getPublishedState', () => {
    it('returns the correct state', () => {
      const mockVersion = {
        Published: true
      };

      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerVersionState version={mockVersion} />
      );

      expect(component.getPublishedState()).toBe('Published');
    });

    it('defaults to "Modified" if not defined', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerVersionState version={{}} />
      );

      expect(component.getPublishedState()).toBe('Saved');
    });
  });

  describe('getDate', () => {
    it('returns a formatted date', () => {
      const mockVersion = {
        LastEdited: '2018-05-03 17:12:00'
      };

      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerVersionState version={mockVersion} />
      );

      // NB: default locale in i18n is en_US
      expect(component.getDate()).toBe('05/03/2018 5:12 PM');
    });
  });

  describe('getBadges', () => {
    it('returns a Badge when the version is live', () => {
      const mockVersion = {
        LiveVersion: true
      };
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerVersionState version={mockVersion} />
      );

      const badge = component.getBadges();
      expect(badge.props.message).toEqual('Live');
      expect(badge.props.status).toEqual('success');
    });

    it('returns an empty string when version is not live', () => {
      component = ReactTestUtils.renderIntoDocument(
        <HistoryViewerVersionState />
      );

      expect(component.getBadges()).toBe('');
    });
  });
});
