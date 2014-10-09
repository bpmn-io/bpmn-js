module.exports = {
  __depends__: [
    require('../modeling'),
    require('../overlays')
  ],
  __init__: [ 'resize', 'resizeVisuals' ],
  resize: [ 'type', require('./Resize') ],
  resizeVisuals: [ 'type', require('./ResizeVisuals') ]
};
