import Injector from 'lib/Injector';
import { combineReducers } from 'redux';
import historyViewerReducer from 'state/historyviewer/HistoryViewerReducer';

const registerReducers = () => {
  Injector.reducer.register('versionedAdmin', combineReducers({
    historyViewer: historyViewerReducer,
  }));
};

export default registerReducers;
