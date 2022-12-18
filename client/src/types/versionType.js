import PropTypes from 'prop-types';

// Describes the expected data structure for a member attached to a version
const memberShape = PropTypes.shape({
  firstName: PropTypes.string,
  surname: PropTypes.string,
});

// Describes the data structure for a Version, returned via GraphQL scaffolding
const versionType = PropTypes.shape({
  version: PropTypes.number,
  absoluteLink: PropTypes.string,
  lastEdited: PropTypes.string,
  published: PropTypes.bool,
  draft: PropTypes.bool,
  deleted: PropTypes.bool,
  liveVersion: PropTypes.bool,
  latestDraftVersion: PropTypes.bool,
  publisher: memberShape,
  author: memberShape,
});

// A default (empty) data set for a version
const defaultVersion = {
  version: 0,
  absoluteLink: '',
  lastEdited: '',
  published: false,
  draft: true,
  deleted: false,
  liveVersion: false,
  latestDraftVersion: false,
  publisher: {
    firstName: '',
    surname: '',
  },
  author: {
    firstName: '',
    surname: '',
  },
};

export { versionType, defaultVersion };
