import React from 'react';

/**
 * Renders a SilverStripe loading animation
 */
const Loading = () => (
  <div className="flexbox-area-grow">
    <div key="overlay" className="cms-content-loading-overlay ui-widget-overlay-light" />
    <div key="spinner" className="cms-content-loading-spinner" />
  </div>
);

export default Loading;
