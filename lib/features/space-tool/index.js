'use strict';

module.exports = {
  __init__: ['spaceToolPreview'],
  __depends__: [
    require('../dragging'),
    require('../rules'),
    require('../tool-manager'),
    require('../preview-support')
  ],
  spaceTool: ['type', require('./SpaceTool')],
  spaceToolPreview: ['type', require('./SpaceToolPreview') ]
};
