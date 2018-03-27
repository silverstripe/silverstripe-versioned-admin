/* global window */
import registerComponents from 'boot/registerComponents';
import registerReducers from 'boot/registerReducers';

window.document.addEventListener('DOMContentLoaded', () => {
  registerComponents();

  registerReducers();
});
