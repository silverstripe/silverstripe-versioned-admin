import HISTORY_VIEWER from './HistoryViewerActionTypes';

const initialState = {
  currentVersion: 0,
  loading: false,
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

    default:
      return state;
  }
}
