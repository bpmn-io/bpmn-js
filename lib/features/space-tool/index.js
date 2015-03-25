module.exports = {
  __init__: ['spaceToolVisuals'],
  __depends__: [require('../dragging'), require('../modeling'), require('../rules') ],
  spaceTool: ['type', require('./SpaceTool')],
  spaceToolVisuals: ['type', require('./SpaceToolVisuals') ]
};
