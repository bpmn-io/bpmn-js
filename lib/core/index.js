'use strict';

module.exports = {
  __depends__: [ require('../draw') ],
  __init__: [ 'canvas' ],
  canvas: [ 'type', require('./Canvas') ],
  commandStack: [ 'type', require('./CommandStack') ],
  elementRegistry: [ 'type', require('./ElementRegistry') ],
  eventBus: [ 'type', require('./EventBus') ],
  graphicsFactory: [ 'type', require('./GraphicsFactory') ]
};