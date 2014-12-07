module.exports = {
  __depends__: [
    require('../selection'),
    require('../rules'),
    require('../dragging')
  ],
  connect: [ 'type', require('./Connect') ]
};
