module.exports = {
  __depends__: [
    require('../dragging'),
    require('../selection'),
    require('../rules')
  ],
  create: [ 'type', require('./Create') ]
};
