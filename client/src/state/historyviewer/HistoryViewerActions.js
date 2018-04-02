import HISTORY_VIEWER from './HistoryViewerActionTypes';

/**
 * Setting the current version will enable context views for a specific record
 * version in the viewer, i.e. a detail or comparison view
 */
export function setCurrentVersion(id) {
  return (dispatch) => {
    dispatch({
      type: HISTORY_VIEWER.SET_CURRENT_VERSION,
      payload: { id },
    });
  };
}
