/* global document */

import React, { PropTypes, PureComponent } from 'react';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import Preview from 'components/Preview/Preview';
import { inject } from 'lib/Injector';
import { versionType } from 'types/versionType';

class HistoryViewerVersionDetail extends PureComponent {
  componentWillMount() {
    this.toggleToolbarClass();
  }

  componentWillUnmount() {
    this.toggleToolbarClass();
  }

  /**
   * Until the CMS is fully React driven, we must control certain aspects of the CMS DOM with
   * manual CSS tweaks. @todo remove this when React drives the CMS.
   */
  toggleToolbarClass() {
    document
      .querySelector('.CMSPageHistoryViewerController div:not(.cms-content-tools) .cms-content-header')
      .classList
      .toggle('history-viewer__toolbar--condensed');
  }

  render() {
    const { ListComponent, schemaUrl, version } = this.props;

    return (
      <div className="flexbox-area-grow fill-width">
        <div className="flexbox-area-grow fill-height">
          <div className="panel panel--padded panel--padded-side panel--scrollable">
            <ListComponent
              extraClass="history-viewer__table--current"
              versions={[version]}
              isActive
            />

            <div className="history-viewer__version-detail">
              <FormBuilderLoader
                identifier="HistoryViewer.VersionDetail"
                schemaUrl={schemaUrl}
              />
            </div>
          </div>
        </div>

        <Preview
          className="history-viewer__preview"
          extraClass="" // removes default: fill-height
          itemLinks={{
            preview: {
              Stage: {
                href: `${version.AbsoluteLink}&archiveDate=${version.LastEdited}`,
                type: 'text/html',
              },
            },
          }}
          itemId={2} // arbitrary, just needs to be truthy
        />
      </div>
    );
  }
}

HistoryViewerVersionDetail.propTypes = {
  ListComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  schemaUrl: React.PropTypes.string.isRequired,
  version: versionType.isRequired,
};

export { HistoryViewerVersionDetail as Component };

export default inject(
  ['HistoryViewerVersionList'],
  (HistoryViewerVersionList) => ({ ListComponent: HistoryViewerVersionList }),
  ({ version }) => `VersionedAdmin.HistoryViewer.HistoryViewerVersionDetail.${version.Version}`
)(HistoryViewerVersionDetail);
