'use strict';

var Events = require('../../util/Event'),
    Geometry = require('../../util/Geometry');

var Snap = require('../../../vendor/snapsvg');

var BENDPOINT_CLS = module.exports.BENDPOINT_CLS = 'djs-bendpoint';
var SEGMENT_DRAGGER_CLS = module.exports.SEGMENT_DRAGGER_CLS = 'djs-segment-dragger';


module.exports.toCanvasCoordinates = function(canvas, event) {

  var position = Events.toPoint(event),
      clientRect = canvas._container.getBoundingClientRect(),
      offset;

  // canvas relative position

  offset = {
    x: clientRect.left,
    y: clientRect.top
  };

  // update actual event payload with canvas relative measures

  var viewbox = canvas.viewbox();

  return {
    x: viewbox.x + (position.x - offset.x) / viewbox.scale,
    y: viewbox.y + (position.y - offset.y) / viewbox.scale
  };
};

module.exports.addBendpoint = function(parentGfx, cls) {
  var groupGfx = parentGfx.group().addClass(BENDPOINT_CLS);

  groupGfx.circle(0, 0, 4).addClass('djs-visual');
  groupGfx.circle(0, 0, 10).addClass('djs-hit');

  if (cls) {
    groupGfx.addClass(cls);
  }

  return groupGfx;
};

function createParallelDragger(parentGfx, position, alignment) {
  var draggerGfx = parentGfx.group();

  var width = 14,
      height = 3,
      padding = 6,
      hitWidth = width + padding,
      hitHeight = height + padding;

  draggerGfx.rect(-width / 2, -height / 2, width, height).addClass('djs-visual');
  draggerGfx.rect(-hitWidth / 2, -hitHeight / 2, hitWidth, hitHeight).addClass('djs-hit');

  var matrix = new Snap.Matrix().rotate(alignment === 'h' ? 90 : 0, 0, 0);

  draggerGfx.transform(matrix);

  return draggerGfx;
}


module.exports.addSegmentDragger = function(parentGfx, segmentStart, segmentEnd) {

  var groupGfx = parentGfx.group(),
      mid = Geometry.getMidPoint(segmentStart, segmentEnd),
      alignment = Geometry.pointsAligned(segmentStart, segmentEnd);

  createParallelDragger(groupGfx, mid, alignment);

  groupGfx.addClass(SEGMENT_DRAGGER_CLS);
  groupGfx.addClass(alignment === 'h' ? 'vertical' : 'horizontal');
  groupGfx.translate(mid.x, mid.y);

  return groupGfx;
};
