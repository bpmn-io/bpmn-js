module.exports = {
  __depends__: [ require('../draw') ],
  __init__: [ 'canvas' ],
  canvas: [ 'type', require('./Canvas') ],
  elementRegistry: [ 'type', require('./ElementRegistry') ],
  elementFactory: [ 'type', require('./ElementFactory') ],
  eventBus: [ 'type', require('./EventBus') ],
  graphicsFactory: [ 'type', require('./GraphicsFactory') ]
};