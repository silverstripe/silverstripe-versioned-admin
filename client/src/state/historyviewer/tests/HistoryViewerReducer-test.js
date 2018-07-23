/* global jest, describe, it, expect */

import historyViewerReducer from 'state/historyviewer/HistoryViewerReducer';
import { defaultCompare } from 'types/compareType';

describe('HistoryViewerReducer', () => {
  let state = {};
  beforeEach(() => {
    state = {
      currentPage: 1,
      currentVersion: 0,
      compare: defaultCompare,
      loading: false,
      messages: [],
    };
  });

  describe('SET_CURRENT_PAGE', () => {
    it('adds the current page to the state', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_CURRENT_PAGE',
        payload: { page: 3 },
      });

      expect(result.currentPage).toBe(3);
    });
  });

  describe('SHOW_VERSION', () => {
    it('sets the current version ID to the current page', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SHOW_VERSION',
        payload: { id: 23 },
      });

      expect(result.currentVersion).toBe(23);
    });
  });

  describe('SHOW_LIST', () => {
    it('resets the page and version', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SHOW_LIST',
      });

      expect(result.currentVersion).toBe(0);
      expect(result.currentPage).toBe(0);
    });
  });

  describe('ADD_MESSAGE', () => {
    it('pushes a new message into the store', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.ADD_MESSAGE',
        payload: {
          type: 'success',
          message: 'hello',
        },
      });

      expect(result.messages.length).toBe(1);
      expect(result.messages[0].message).toBe('hello');
    });
  });

  describe('CLEAR_MESSAGES', () => {
    it('clears all messages from the store', () => {
      state.messages = [{
        type: 'success',
        message: 'hello world',
      }];

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.CLEAR_MESSAGES',
      });

      expect(result.messages.length).toBe(0);
    });
  });

  describe('SET_COMPARE_MODE', () => {
    it('sets compare to the default enabled value when enabling compare mode', () => {
      state = {
        ...state,
        compare: false,
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_MODE',
        payload: { enabled: true },
      });

      expect(result.compare).toEqual({ versionFrom: 0, versionTo: 0 });
    });

    it('resets the compare from/to versions when not in compare mode', () => {
      state = {
        ...state,
        compare: { versionFrom: 1, versionTo: 2 },
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_MODE',
        payload: { enabled: false },
      });

      expect(result.compare).toBe(false);
    });
  });

  describe('SET_COMPARE_FROM', () => {
    it('sets the compareFrom to the version', () => {
      state = {
        ...state,
        compare: { versionFrom: 0, versionTo: 0 },
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_FROM',
        payload: { version: 47 },
      });

      expect(result.compare.versionFrom).toBe(47);
    });

    it('uses compareTo for compareFrom when version is zero', () => {
      state = {
        ...state,
        compare: { versionFrom: 50, versionTo: 80 },
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_FROM',
        payload: { version: 0 },
      });

      expect(result.compare.versionFrom).toBe(80);
      expect(result.compare.versionTo).toBe(0);
    });
  });

  describe('SET_COMPARE_TO', () => {
    it('sets the compareTo version', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_TO',
        payload: { version: 85 },
      });

      expect(result.compare.versionTo).toBe(85);
    });

    it('flips the versions if a lower version "to" is selected', () => {
      state = {
        ...state,
        compare: { versionFrom: 50, versionTo: 100 },
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_TO',
        payload: { version: 25 },
      });

      expect(result.compare.versionFrom).toBe(25);
      expect(result.compare.versionTo).toBe(50);
    });
  });
});
