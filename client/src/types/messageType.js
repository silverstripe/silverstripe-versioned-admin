import PropTypes from 'prop-types';

// Describes the structure of a message that can be shared between components via Redux
const messageType = PropTypes.shape({
  id: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['error', 'info', 'success', 'warning']),
});

export { messageType };
