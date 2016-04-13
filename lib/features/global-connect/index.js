module.exports = {
  __depends__: [
    require('../connect'),
    require('../rules'),
    require('../dragging'),
    require('../tool-manager')
  ],
  globalConnect: [ 'type', require('./GlobalConnect') ]
};
