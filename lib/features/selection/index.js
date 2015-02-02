module.exports = {
  __init__: [ 'selectionVisuals', 'selectionBehavior' ],
  __depends__: [
    require('../interaction-events'),
    require('../outline')
  ],
  selection: [ 'type', require('./Selection') ],
  selectionVisuals: [ 'type', require('./SelectionVisuals') ],
  selectionBehavior: [ 'type', require('./SelectionBehavior') ]
};
