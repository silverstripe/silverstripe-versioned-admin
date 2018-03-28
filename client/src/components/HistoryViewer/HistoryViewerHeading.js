import i18n from 'i18n';
import React from 'react';

const HistoryViewerHeading = (props) => (
  <tr>
    <th>#</th>
    <th>{i18n._t('HistoryViewer.Record', 'Record')}</th>
    <th>{i18n._t('HistoryViewer.Author', 'Author')}</th>
    {props.hasActions ? <th /> : null}
  </tr>
);

HistoryViewerHeading.propTypes = {
  hasActions: React.PropTypes.bool,
};

HistoryViewerHeading.defaultProps = {
  hasActions: false,
};

export default HistoryViewerHeading;
