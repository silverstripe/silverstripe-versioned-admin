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
   * If the preview panel is enabled, return the component
   *
   * @returns {Preview|null}
   */
  getPreview() {
    const { version, isPreviewable } = this.props;

    if (!isPreviewable) {
      return null;
    }

    return (
      <Preview
        className="history-viewer__preview flexbox-area-grow" // removes default: fill-height
        itemLinks={{
          preview: {
            Stage: {
              href: `${version.AbsoluteLink}&archiveDate=${version.LastEdited}`,
              type: 'text/html',
            },
          },
        }}
        itemId={version.Version}
      />
    );
  }

  /**
   * Until the CMS is fully React driven, we must control certain aspects of the CMS DOM with
   * manual CSS tweaks. @todo remove this when React drives the CMS.
   */
  toggleToolbarClass() {
    const { isPreviewable } = this.props;

    const selector = document
      .querySelector('.CMSPageHistoryViewerController div:not(.cms-content-tools) .cms-content-header');

    if (selector && isPreviewable) {
      selector
        .classList
        .toggle('history-viewer__toolbar--condensed');
    }
  }

  render() {
    const { isPreviewable, ListComponent, schemaUrl, version } = this.props;

    return (
      <div className="flexbox-area-grow fill-width">
        <div className="flexbox-area-grow fill-height">
          <div className={isPreviewable ? 'panel panel--padded panel--padded-side panel--scrollable' : ''}>
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

        {this.getPreview()}
      </div>
    );
  }
}

HistoryViewerVersionDetail.propTypes = {
  isPreviewable: PropTypes.bool,
  ListComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  schemaUrl: React.PropTypes.string.isRequired,
  version: versionType.isRequired,
};

HistoryViewerVersionDetail.defaultProps = {
  isPreviewable: false,
};

export { HistoryViewerVersionDetail as Component };

export default inject(
  ['HistoryViewerVersionList'],
  (HistoryViewerVersionList) => ({ ListComponent: HistoryViewerVersionList }),
  ({ version }) => `VersionedAdmin.HistoryViewer.HistoryViewerVersionDetail.${version.Version}`
)(HistoryViewerVersionDetail);
