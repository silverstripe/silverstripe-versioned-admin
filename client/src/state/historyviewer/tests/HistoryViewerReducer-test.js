/* global jest, describe, it, expect */

import historyViewerReducer from 'state/historyviewer/HistoryViewerReducer';

describe('HistoryViewerReducer', () => {
  let state = {};
  beforeEach(() => {
    state = {
      currentPage: 1,
      currentVersion: 0,
      compareFrom: 0,
      compareTo: 0,
      compareMode: false,
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
    it('sets compareMode to true when enabling compare mode', () => {
      state = {
        ...state,
        compareFrom: 2,
        compareTo: 5,
        compareMode: false,
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_MODE',
        payload: { enabled: true },
      });

      expect(result.compareMode).toBe(true);
      expect(result.compareFrom).toBe(2);
      expect(result.compareTo).toBe(5);
    });

    it('resets the compare from/to versions when not in compare mode', () => {
      state = {
        ...state,
        compareFrom: 1,
        compareTo: 2,
        compareMode: true,
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_MODE',
        payload: { enabled: false },
      });

      expect(result.compareMode).toBe(false);
    });
  });

  describe('SET_COMPARE_FROM', () => {
    it('sets the compareFrom to the version', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_FROM',
        payload: { version: 47 },
      });

      expect(result.compareFrom).toBe(47);
    });

    it('uses compareTo for compareFrom when version is zero', () => {
      state = {
        ...state,
        compareFrom: 50,
        compareTo: 80,
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_FROM',
        payload: { version: 0 },
      });

      expect(result.compareFrom).toBe(80);
      expect(result.compareTo).toBe(0);
    });
  });

  describe('SET_COMPARE_TO', () => {
    it('sets the compareTo version', () => {
      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_TO',
        payload: { version: 85 },
      });

      expect(result.compareTo).toBe(85);
    });

    it('flips the versions if a lower version "to" is selected', () => {
      state = {
        ...state,
        compareFrom: 50,
        compareTo: 100,
      };

      const result = historyViewerReducer(state, {
        type: 'HISTORY_VIEWER.SET_COMPARE_TO',
        payload: { version: 25 },
      });

      expect(result.compareFrom).toBe(25);
      expect(result.compareTo).toBe(50);
    });
  });
});
