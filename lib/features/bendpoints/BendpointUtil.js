'use strict';

var Events = require('../../util/Event'),
    Geometry = require('../../util/Geometry');

var BENDPOINT_CLS = module.exports.BENDPOINT_CLS = 'djs-bendpoint';
var SEGMENT_DRAGGER_CLS = module.exports.SEGMENT_DRAGGER_CLS = 'djs-segment-dragger';

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgClasses = require('tiny-svg/lib/classes'),
    svgCreate = require('tiny-svg/lib/create');

var rotate = require('../../util/SvgTransformUtil').rotate,
    translate = require('../../util/SvgTransformUtil').translate;


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
  var groupGfx = svgCreate('g');
  svgClasses(groupGfx).add(BENDPOINT_CLS);

  svgAppend(parentGfx, groupGfx);

  var visual = svgCreate('circle');
  svgAttr(visual, {
    cx: 0,
    cy: 0,
    r: 4
  });
  svgClasses(visual).add('djs-visual');

  svgAppend(groupGfx, visual);

  var hit = svgCreate('circle');
  svgAttr(hit, {
    cx: 0,
    cy: 0,
    r: 10
  });
  svgClasses(hit).add('djs-hit');

  svgAppend(groupGfx, hit);

  if (cls) {
    svgClasses(groupGfx).add(cls);
  }

  return groupGfx;
};

function createParallelDragger(parentGfx, position, alignment) {
  var draggerGfx = svgCreate('g');

  svgAppend(parentGfx, draggerGfx);

  var width = 14,
      height = 3,
      padding = 6,
      hitWidth = width + padding,
      hitHeight = height + padding;

  var visual = svgCreate('rect');
  svgAttr(visual, {
    x: -width / 2,
    y: -height / 2,
    width: width,
    height: height
  });
  svgClasses(visual).add('djs-visual');

  svgAppend(draggerGfx, visual);

  var hit = svgCreate('rect');
  svgAttr(hit, {
    x: -hitWidth / 2,
    y: -hitHeight / 2,
    width: hitWidth,
    height: hitHeight
  });
  svgClasses(hit).add('djs-hit');

  svgAppend(draggerGfx, hit);

  rotate(draggerGfx, alignment === 'h' ? 90 : 0, 0, 0);

  return draggerGfx;
}


module.exports.addSegmentDragger = function(parentGfx, segmentStart, segmentEnd) {

  var groupGfx = svgCreate('g'),
      mid = Geometry.getMidPoint(segmentStart, segmentEnd),
      alignment = Geometry.pointsAligned(segmentStart, segmentEnd);

  svgAppend(parentGfx, groupGfx);

  createParallelDragger(groupGfx, mid, alignment);

  svgClasses(groupGfx).add(SEGMENT_DRAGGER_CLS);
  svgClasses(groupGfx).add(alignment === 'h' ? 'vertical' : 'horizontal');

  translate(groupGfx, mid.x, mid.y);

  return groupGfx;
};
