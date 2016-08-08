module.exports = {
  __depends__: [
    require('../rules'),
    require('../dragging'),
    require('../preview-support')
  ],
  __init__: [ 'resize', 'resizePreview', 'resizeHandles' ],
  resize: [ 'type', require('./Resize') ],
  resizePreview: [ 'type', require('./ResizePreview') ],
  resizeHandles: [ 'type', require('./ResizeHandles') ]
};
