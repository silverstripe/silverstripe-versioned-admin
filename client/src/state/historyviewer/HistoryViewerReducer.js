import HISTORY_VIEWER from './HistoryViewerActionTypes';

const initialState = {
  currentPage: 1,
  currentVersion: 0,
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
        currentVersion: payload.id,
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
      if (state.messages.length) {
        return {
          ...state,
          messages: [],
        };
      }

      return state;
    }

    default:
      return state;
  }
}
