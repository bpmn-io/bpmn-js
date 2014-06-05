'use strict';

module.exports = {
  __init__: [ 'selectionVisuals' ],
  __depends__: [
    require('../interaction-events'),
    require('../outline')
  ],
  selection: [ 'type', require('./Selection') ],
  selectionVisuals: [ 'type', require('./SelectionVisuals') ]
};