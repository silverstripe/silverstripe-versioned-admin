import HISTORY_VIEWER from './HistoryViewerActionTypes';
import uuidv1 from 'uuid/v1';

/**
 * Setting the current version will enable context views for a specific record
 * version in the viewer, i.e. a detail or comparison view
 *
 * @param {int} id
 * @returns {function}
 */
export function showVersion(id) {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.SHOW_VERSION,
      payload: { id },
    });
    dispatch({
      type: HISTORY_VIEWER.CLEAR_MESSAGES,
    });
  };
}

/**
 * Return to list view
 * @returns {function}
 */
export function showList() {
  return {
    type: HISTORY_VIEWER.SHOW_LIST,
  };
}

/**
 * Set the current pagination page number for the list of history viewer versions
 *
 * @param {int} page
 * @returns {function}
 */
export function setCurrentPage(page) {
  return {
    type: HISTORY_VIEWER.SET_CURRENT_PAGE,
    payload: { page },
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
  return {
    type: HISTORY_VIEWER.ADD_MESSAGE,
    payload: { id: uuidv1(), message, type },
  };
}

/**
 * Clear all status messages
 *
 * @returns {function}
 */
export function clearMessages() {
  return {
    type: HISTORY_VIEWER.CLEAR_MESSAGES,
    payload: {},
  };
}

/**
 * Enables or disables the comparison mode
 *
 * @param {boolean} enabled
 * @returns {function}
 */
export function setCompareMode(enabled) {
  return {
    type: HISTORY_VIEWER.SET_COMPARE_MODE,
    payload: { enabled },
  };
}

/**
 * Sets the comparison mode 'from' a version
 *
 * @param {int} version
 * @returns {function}
 */
export function setCompareFrom(version) {
  return {
    type: HISTORY_VIEWER.SET_COMPARE_FROM,
    payload: { version },
  };
}

/**
 * Sets the comparison mode 'to' a version
 *
 * @param {int} version
 * @returns {function}
 */
export function setCompareTo(version) {
  return {
    type: HISTORY_VIEWER.SET_COMPARE_TO,
    payload: { version },
  };
}
