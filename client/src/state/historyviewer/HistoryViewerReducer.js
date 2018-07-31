import HISTORY_VIEWER from './HistoryViewerActionTypes';
import { defaultCompare } from 'types/compareType';

const initialState = {
  currentPage: 1,
  currentVersion: false,
  compare: defaultCompare,
  loading: false,
  messages: [],
};

/**
 * Reducer for the `versionedAdmin.historyViewer` state key.
 *
 * @param {object} state
 * @param {string} type - Name of the dispatched action.
 * @param {object} payload - Optional data passed with the action.
 */
export default function historyViewerReducer(state = initialState, { type, payload } = {}) {
  switch (type) {
    case HISTORY_VIEWER.SET_CURRENT_PAGE: {
      return {
        ...state,
        currentPage: payload.page,
      };
    }

    case HISTORY_VIEWER.SHOW_VERSION: {
      return {
        ...state,
        currentVersion: payload.version,
      };
    }

    case HISTORY_VIEWER.SHOW_LIST: {
      return {
        ...state,
        currentVersion: 0,
        currentPage: 0,
      };
    }

    case HISTORY_VIEWER.ADD_MESSAGE: {
      return {
        ...state,
        messages: [
          payload,
          ...state.messages,
        ],
      };
    }

    case HISTORY_VIEWER.CLEAR_MESSAGES: {
      return {
        ...state,
        messages: [],
      };
    }

    case HISTORY_VIEWER.SET_COMPARE_MODE: {
      const initialCompare = {
        versionFrom: false,
        versionTo: false,
        ...state.compare
      };

      return {
        ...state,
        compare: payload.enabled ? initialCompare : false,
      };
    }

    case HISTORY_VIEWER.SET_COMPARE_FROM: {
      let { compare: { versionFrom, versionTo } } = state;
      versionFrom = payload.version || false;

      if (!versionFrom) {
        versionFrom = versionTo;
        versionTo = false;
      }

      return {
        ...state,
        compare: { versionFrom, versionTo },
      };
    }

    case HISTORY_VIEWER.SET_COMPARE_TO: {
      let { compare: { versionFrom, versionTo } } = state;
      versionTo = payload.version || false;

      // A normal `diff` always shows what it takes turn FROM into TO
      // Here, comparisons are always FROM oldest TO newest version
      // Version IDs (versionObject.Version) are always positive & in creation order.
      if (versionTo && versionFrom && versionTo.Version < versionFrom.Version) {
        versionFrom = versionTo;
        versionTo = state.compare.versionFrom;
      }

      return {
        ...state,
        compare: { versionFrom, versionTo },
      };
    }

    default:
      return state;
  }
}
