// Action type constants, of the form
// HISTORYVIEWER.SET_CURRENT_VERSION === 'HISTORYVIEWER.SET_CURRENT_VERSION'

export default [
  'SET_CURRENT_VERSION',
  'CLEAR_CURRENT_VERSION',
].reduce((obj, item) => Object.assign(obj, { [item]: `HISTORYVIEWER.${item}` }), {});
