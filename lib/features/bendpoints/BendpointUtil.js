'use strict';

var Events = require('../../util/Event'),
    Geometry = require('../../util/Geometry');

var BENDPOINT_CLS = module.exports.BENDPOINT_CLS = 'djs-bendpoint';
var SEGMENT_DRAGGER_CLS = module.exports.SEGMENT_DRAGGER_CLS = 'djs-segment-dragger';

var domClasses = require('min-dom/lib/classes');

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create'),
    svgTransform = require('tiny-svg/lib/transform');

var createTransform = require('tiny-svg/lib/geometry').createTransform;


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
  domClasses(groupGfx).add(BENDPOINT_CLS);

  svgAppend(parentGfx, groupGfx);

  var visual = svgCreate('circle');
  svgAttr(visual, {
    cx: 0,
    cy: 0,
    r: 4
  });
  domClasses(visual).add('djs-visual');

  svgAppend(groupGfx, visual);

  var hit = svgCreate('circle');
  svgAttr(hit, {
    cx: 0,
    cy: 0,
    r: 10
  });
  domClasses(hit).add('djs-hit');

  svgAppend(groupGfx, hit);

  if (cls) {
    domClasses(groupGfx).add(cls);
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
  domClasses(visual).add('djs-visual');

  svgAppend(draggerGfx, visual);

  var hit = svgCreate('rect');
  svgAttr(hit, {
    x: -hitWidth / 2,
    y: -hitHeight / 2,
    width: hitWidth,
    height: hitHeight
  });
  domClasses(hit).add('djs-hit');

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

  domClasses(groupGfx).add(SEGMENT_DRAGGER_CLS);
  domClasses(groupGfx).add(alignment === 'h' ? 'vertical' : 'horizontal');

  translate(groupGfx, mid.x, mid.y);

  return groupGfx;
};

////////// helpers //////////

/**
 * @param {<SVGElement>} element
 * @param {Number} angle
 */
function rotate(element, angle) {
  var rotate = createTransform();
  rotate.setRotate(angle, 0, 0);

  svgTransform(element, rotate);
}

/**
 * @param {<SVGElement>} element
 * @param {Number} x
 * @param {Number} y
 */
function translate(element, x, y) {
  var translate = createTransform();
  translate.setTranslate(x, y);

  svgTransform(element, translate);
}
