module.exports = {
  __depends__: [
    require('../dragging'),
    require('../selection')
  ],
  create: [ 'type', require('./Create') ]
};