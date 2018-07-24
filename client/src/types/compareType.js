import { PropTypes } from 'react';

// Describes the data structure for compare version storage
const compareType = PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
  versionFrom: PropTypes.number,
  versionTo: PropTypes.number
})]);

// A default (empty) data set for a version
const defaultCompare = false;

export { compareType, defaultCompare };
