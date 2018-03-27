import React, { Component } from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';

class HistoryViewerVersionDetail extends Component {
  render() {
    const schemaUrl = 'http://ss42.localhost/admin/historyviewer/schema/versionForm?RecordClass=SilverStripe\\CMS\\Model\\SiteTree&RecordID=2&RecordVersion=1';
    return (
      <div className="history-viewer__version-detail">
        <FormBuilderLoader
          identifier="HistoryViewer.VersionDetail" schemaUrl={schemaUrl}
        />
      </div>
    );
  }
}

export default HistoryViewerVersionDetail;
