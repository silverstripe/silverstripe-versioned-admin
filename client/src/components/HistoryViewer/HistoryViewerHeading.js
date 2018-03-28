import i18n from 'i18n';
import React from 'react';

const HistoryViewerHeading = () => (
  <tr>
    <th>#</th>
    <th>{i18n._t('HistoryViewer.Record', 'Record')}</th>
    <th>{i18n._t('HistoryViewer.Author', 'Author')}</th>
  </tr>
);

export default HistoryViewerHeading;
