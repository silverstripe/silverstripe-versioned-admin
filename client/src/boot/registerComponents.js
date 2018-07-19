import Injector from 'lib/Injector';
import HistoryViewer from 'components/HistoryViewer/HistoryViewer';
import HistoryViewerHeading from 'components/HistoryViewer/HistoryViewerHeading';
import HistoryViewerToolbar from 'components/HistoryViewer/HistoryViewerToolbar';
import HistoryViewerVersion from 'components/HistoryViewer/HistoryViewerVersion';
import HistoryViewerVersionDetail from 'components/HistoryViewer/HistoryViewerVersionDetail';
import HistoryViewerVersionList from 'components/HistoryViewer/HistoryViewerVersionList';
import HistoryViewerVersionState from 'components/HistoryViewer/HistoryViewerVersionState';
import HistoryViewerCompareWarning from 'components/HistoryViewer/HistoryViewerCompareWarning';

export default () => {
  Injector.component.registerMany({
    HistoryViewer,
    HistoryViewerHeading,
    HistoryViewerToolbar,
    HistoryViewerVersion,
    HistoryViewerVersionDetail,
    HistoryViewerVersionList,
    HistoryViewerVersionState,
    HistoryViewerCompareWarning,
  });
};

