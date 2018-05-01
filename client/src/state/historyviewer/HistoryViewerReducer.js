import HISTORY_VIEWER from './HistoryViewerActionTypes';

const initialState = {
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
    case HISTORY_VIEWER.SET_CURRENT_VERSION: {
      return {
        ...state,
        currentVersion: payload.id,
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

    case HISTORY_VIEWER.REFETCH_VERSIONS: {
      return {
        ...state,
        refetchVersions: true,
      };
    }

    default:
      return state;
  }
}
