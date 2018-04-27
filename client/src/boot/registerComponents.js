import Injector from 'lib/Injector';
import HistoryViewer from 'components/HistoryViewer/HistoryViewer';
import HistoryViewerHeading from 'components/HistoryViewer/HistoryViewerHeading';
import HistoryViewerVersion from 'components/HistoryViewer/HistoryViewerVersion';
import HistoryViewerVersionDetail from 'components/HistoryViewer/HistoryViewerVersionDetail';
import HistoryViewerVersionList from 'components/HistoryViewer/HistoryViewerVersionList';
import HistoryViewerVersionState from 'components/HistoryViewer/HistoryViewerVersionState';

export default () => {
  Injector.component.registerMany({
    HistoryViewer,
    HistoryViewerHeading,
    HistoryViewerVersion,
    HistoryViewerVersionDetail,
    HistoryViewerVersionList,
    HistoryViewerVersionState,
  });
};

