module.exports = {
  __init__: [
    'hoverFix'
  ],
  __depends__: [
    require('../selection')
  ],
  dragging: [ 'type', require('./Dragging') ],
  hoverFix: [ 'type', require('./HoverFix') ]
};