import React, { Component } from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import HistoryViewerVersionList from './HistoryViewerVersionList';
import Loading from './Loading';
import { versionType } from 'types/versionType';

class HistoryViewerVersionDetail extends Component {
  constructor(props) {
    super(props);

    this.handleLoadingSuccess = this.handleLoadingSuccess.bind(this);

    this.state = {
      loading: true,
    };
  }

  /**
   * When the form builder has finished loading the schema, change the state
   * to remove the loading indicator
   */
  handleLoadingSuccess() {
    this.setState({
      loading: false
    });
  }

  render() {
    const { handleSetCurrentVersion, schemaUrl, version } = this.props;
    const { loading } = this.state;

    return (
      <div className="history-viewer">
        <HistoryViewerVersionList
          extraClass="history-viewer__table--current"
          versions={[version]}
          handleSetCurrentVersion={handleSetCurrentVersion}
          isActive
        />

        <div className="history-viewer__version-detail">
          <FormBuilderLoader
            identifier="HistoryViewer.VersionDetail"
            schemaUrl={schemaUrl}
            onLoadingSuccess={this.handleLoadingSuccess}
          />
        </div>

        { loading ? <Loading /> : null }
      </div>
    );
  }
}

HistoryViewerVersionDetail.propTypes = {
  schemaUrl: React.PropTypes.string.isRequired,
  handleSetCurrentVersion: React.PropTypes.func,
  version: versionType.isRequired,
};

export default HistoryViewerVersionDetail;
