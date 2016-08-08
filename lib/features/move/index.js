module.exports = {
  __depends__: [
    require('../interaction-events'),
    require('../selection'),
    require('../outline'),
    require('../rules'),
    require('../dragging'),
    require('../preview-support')
  ],
  __init__: [ 'move', 'movePreview' ],
  move: [ 'type', require('./Move') ],
  movePreview: [ 'type', require('./MovePreview') ]
};
