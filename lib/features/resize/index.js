module.exports = {
  __depends__: [
    require('../rules'),
    require('../dragging')
  ],
  __init__: [ 'resize', 'resizeVisuals', 'resizeHandles' ],
  resize: [ 'type', require('./Resize') ],
  resizeVisuals: [ 'type', require('./ResizeVisuals') ],
  resizeHandles: [ 'type', require('./ResizeHandles') ]
};
