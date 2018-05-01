import HISTORY_VIEWER from './HistoryViewerActionTypes';

/**
 * Setting the current version will enable context views for a specific record
 * version in the viewer, i.e. a detail or comparison view
 *
 * @param {int} id
 */
export function setCurrentVersion(id) {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.SET_CURRENT_VERSION,
      payload: { id },
    });
  };
}

/**
 * Cause the history viewer to reset and refetch the version list.
 *
 * PLEASE NOTE: This is a temporary action, and will be removed in future when replaced
 * with React router: https://github.com/silverstripe/silverstripe-versioned-admin/issues/1
 */
export function refetchVersions() {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.REFETCH_VERSIONS,
      payload: {},
    });
  };
}

/**
 * Add a new status message, for example "Successfully reverted to version 123"
 *
 * @param {string} message
 * @param {string} type
 * @returns {function}
 */
export function addMessage(message, type = 'success') {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.ADD_MESSAGE,
      payload: { message, type },
    });
  };
}

/**
 * Clear all status messages
 *
 * @returns {function}
 */
export function clearMessages() {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.CLEAR_MESSAGES,
      payload: {},
    });
  };
}
