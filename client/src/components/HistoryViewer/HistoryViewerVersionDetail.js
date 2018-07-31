/* global document */

import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import FormBuilderLoader from 'containers/FormBuilderLoader/FormBuilderLoader';
import { inject } from 'lib/Injector';
import { versionType } from 'types/versionType';

class HistoryViewerVersionDetail extends PureComponent {
  componentWillMount() {
    this.toggleToolbarClass(true);
  }

  /**
   * When new props are received (from Redux dispatch events), check whether the preview
   * state changes. If so, we want to add or remove the legacy CSS modifier for the CMS
   * north toolbar based on whether the view mode is "split" (add) or anything else (remove)
   *
   * @param {Object} nextProps
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.previewState !== this.props.previewState) {
      this.toggleToolbarClass(nextProps.previewState === 'split');
    }
  }

  componentWillUnmount() {
    this.toggleToolbarClass(false);
  }

  /**
   * Originally this component hard coded the array of versions to be passed
   * to the list component as [version], but with the introduction of a compare mode
   * this isn't always true (we need both "compare from" & "compare to").
   * So this getter abstracts that logic.
   *
   * @returns {array}
   */
  getListVersions() {
    const { compare, version } = this.props;
    if (this.isCompareMode()) {
      return [compare.versionTo, compare.versionFrom];
    }
    return [version];
  }

  /*
   * Return whether or not we should be displaying the preview component
   * @returns {boolean}
   */
  isPreviewable() {
    const { isPreviewable } = this.props;
    return isPreviewable && !this.isCompareMode();
  }

  /*
   * Return whether or not we should be comparing two versions
   * @returns {boolean}
   */
  isCompareMode() {
    const { compare } = this.props;
    return compare && compare.versionFrom && compare.versionTo;
  }

  /**
   * Until the CMS is fully React driven, we must control certain aspects of the CMS DOM with
   * manual CSS tweaks. @todo remove this when React drives the CMS.
   *
   * @param {boolean} add
   */
  toggleToolbarClass(add = true) {
    const selector = document
      .querySelector('.CMSPageHistoryViewerController div:not(.cms-content-tools) .cms-content-header');
    const className = 'history-viewer__toolbar--condensed';

    if (selector && this.isPreviewable()) {
      if (add) {
        selector.classList.add(className);
      } else {
        selector.classList.remove(className);
      }
    }
  }

  /**
   * If the preview panel is enabled, return the component
   *
   * @returns {Preview|null}
   */
  renderPreview() {
    const { version, PreviewComponent, previewState } = this.props;

    // Don't render the preview if the view mode is "edit"
    if (!this.isPreviewable() || previewState === 'edit') {
      return null;
    }

    return (
      <PreviewComponent
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
   * If the toolbar should be viewable, return the component
   *
   * @returns {HistoryViewerToolbar|null}
   */
  renderToolbar() {
    const { ToolbarComponent, isLatestVersion, recordId, version } = this.props;

    if (this.isCompareMode()) {
      return null;
    }

    return (
      <ToolbarComponent
        identifier="HistoryViewer.VersionDetail.Toolbar"
        isLatestVersion={isLatestVersion}
        recordId={recordId}
        versionId={version.Version}
        isPreviewable={this.isPreviewable()}
      />
    );
  }

  /**
   * Renders the version detail view form
   *
   * @returns {Object}
   */
  renderDetails() {
    const { ListComponent, schemaUrl, CompareWarningComponent, previewState } = this.props;

    // Hide when the preview mode is explicitly enabled
    if (this.isPreviewable() && previewState === 'preview') {
      return null;
    }

    const containerClasses = [
      'flexbox-area-grow',
      'panel',
      'panel--scrollable',
      'panel--padded',
      'panel--padded-side',
    ];
    const extraListClasses = {
      'history-viewer__table': true,
      'history-viewer__table--current': true,
      'history-viewer__table--compare': this.isCompareMode(),
    };
    const formClasses = {
      'history-viewer__version-detail': true,
      'history-viewer__version-detail--compare': this.isCompareMode(),
    };

    return (
      <div className="flexbox-area-grow fill-height">
        <div className={classnames(containerClasses)}>
          <ListComponent
            extraClass={classnames(extraListClasses)}
            versions={this.getListVersions()}
          />

          <div className={classnames(formClasses)}>
            <FormBuilderLoader
              identifier="HistoryViewer.VersionDetail"
              schemaUrl={schemaUrl}
            />
          </div>
        </div>

        {this.renderToolbar()}

        <CompareWarningComponent fixed />
      </div>
    );
  }

  render() {
    return (
      <div className="flexbox-area-grow fill-width">
        {this.renderDetails()}
        {this.renderPreview()}
      </div>
    );
  }
}

HistoryViewerVersionDetail.propTypes = {
  isLatestVersion: PropTypes.bool,
  isPreviewable: PropTypes.bool,
  ListComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  PreviewComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  recordId: PropTypes.number.isRequired,
  schemaUrl: PropTypes.string.isRequired,
  ToolbarComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  version: versionType,
  compare: PropTypes.oneOfType([
    PropTypes.shape({
      versionFrom: versionType,
      versionTo: versionType,
    }),
    PropTypes.bool,
  ]),
  previewState: PropTypes.oneOf(['edit', 'preview', 'split']),
};

HistoryViewerVersionDetail.defaultProps = {
  isLatestVersion: false,
  isPreviewable: false,
  compare: false,
};

export { HistoryViewerVersionDetail as Component };

export default inject(
  ['HistoryViewerVersionList', 'HistoryViewerToolbar', 'Preview', 'HistoryViewerCompareWarning'],
  (ListComponent, ToolbarComponent, PreviewComponent, CompareWarningComponent) => ({
    ListComponent,
    ToolbarComponent,
    PreviewComponent,
    CompareWarningComponent,
  }),
  ({ version }, context) => `${context}.HistoryViewerVersionDetail.${version.Version}`
)(HistoryViewerVersionDetail);
