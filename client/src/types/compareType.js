import PropTypes from 'prop-types';
import { versionType } from './versionType';

// Describes the data structure for compare version storage
const compareType = PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
  versionFrom: versionType,
  versionTo: versionType,
})]);

// A default (empty) data set for a version
const defaultCompare = false;

export { compareType, defaultCompare };
