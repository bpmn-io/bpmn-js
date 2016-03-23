'use strict';

module.exports = {
  __init__: ['spaceToolVisuals'],
  __depends__: [
    require('../dragging'),
    require('../rules'),
    require('../tool-manager')
  ],
  spaceTool: ['type', require('./SpaceTool')],
  spaceToolVisuals: ['type', require('./SpaceToolVisuals') ]
};
