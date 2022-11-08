/* eslint-disable
 import/no-webpack-loader-syntax,
 import/no-extraneous-dependencies,
 import/no-unresolved
 */

// Expose fields (see webpack config for matching "externals" config)
require('expose-loader?exposes=HistoryViewer!components/HistoryViewer/HistoryViewer');

require('expose-loader?exposes=versionType!types/versionType');

// Legacy CMS
require('../legacy/ArchiveAdmin/ArchiveAdmin');

// Legacy form fields
// Fields used by core legacy UIs, or available to users
// To do: determine better way of using webpack to pull in optional javascript
require('../legacy/HistoryViewer/HistoryViewerEntwine');

require('../legacy/VersionedEditForm/VersionedEditForm');

require('boot');
