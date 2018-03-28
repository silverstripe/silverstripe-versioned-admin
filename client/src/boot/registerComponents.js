import Injector from 'lib/Injector';
import HistoryViewer from 'components/HistoryViewer/HistoryViewer';

export default () => {
  Injector.component.register('HistoryViewer', HistoryViewer);
};
