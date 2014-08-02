module.exports = {
  __depends__: [
    require('../interaction-events'),
    require('../selection'),
    require('../outline'),
    require('../rules')
  ],
  __init__: [ 'moveEvents', 'moveVisuals' ],
  moveEvents: [ 'type', require('./MoveEvents') ],
  moveVisuals: [ 'type', require('./MoveVisuals') ],
  dragSupport: [ 'type', require('./DragSupport') ]
};
