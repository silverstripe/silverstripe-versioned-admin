import HISTORY_VIEWER from './HistoryViewerActionTypes';
import uuidv1 from 'uuid/v1';

/**
 * Setting the current version will enable context views for a specific record
 * version in the viewer, i.e. a detail or comparison view
 *
 * @param {int} id
 * @returns {function}
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
 * Set the current pagination page number for the list of history viewer versions
 *
 * @param {int} page
 * @returns {function}
 */
export function setCurrentPage(page) {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.SET_CURRENT_PAGE,
      payload: { page },
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
      payload: { id: uuidv1(), message, type },
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
