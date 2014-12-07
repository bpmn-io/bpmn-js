module.exports = {
  __depends__: [
    require('../interaction-events'),
    require('../selection'),
    require('../outline'),
    require('../rules'),
    require('../dragging')
  ],
  __init__: [ 'move', 'moveVisuals' ],
  move: [ 'type', require('./Move') ],
  moveVisuals: [ 'type', require('./MoveVisuals') ]
};
