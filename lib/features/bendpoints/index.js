module.exports = {
  __depends__: [ require('../dragging'), require('../rules') ],
  __init__: [ 'bendpoints', 'bendpointSnapping' ],
  bendpoints: [ 'type', require('./Bendpoints') ],
  bendpointMove: [ 'type', require('./BendpointMove') ],
  connectionSegmentMove: [ 'type', require('./ConnectionSegmentMove') ],
  bendpointSnapping: [ 'type', require('./BendpointSnapping') ]
};
