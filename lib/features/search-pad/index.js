module.exports = {
  __depends__: [
    require('../overlays'),
    require('../selection')
  ],
  searchPad: [ 'type', require('./SearchPad') ]
};
