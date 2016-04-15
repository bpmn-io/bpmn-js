module.exports = {
  __depends__: [
    require('../dragging'),
    require('../mouse-tracking')
  ],
  __init__: [ 'autoScroll' ],
  autoScroll: [ 'type', require('./AutoScroll') ],
};