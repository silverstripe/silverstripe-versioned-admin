import { PropTypes } from 'react';

// Describes the structure of a message that can be shared between components via Redux
const messageType = PropTypes.shape({
  key: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['error', 'info', 'success', 'warning']),
});

export { messageType };
