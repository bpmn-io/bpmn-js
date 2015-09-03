'use strict';

var Events = require('../../util/Event'),
    Geometry = require('../../util/Geometry');

var BENDPOINT_CLS = module.exports.BENDPOINT_CLS = 'djs-bendpoint';
var DRAGMARKER_CLS = module.exports.DRAGMARKER_CLS = 'djs-dragmarker';

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

module.exports.addBendpoint = function(parentGfx, css_class) {
  var groupGfx = parentGfx.group().addClass(BENDPOINT_CLS);

  groupGfx.circle(0, 0, 4).addClass('djs-visual');
  groupGfx.circle(0, 0, 10).addClass('djs-hit');

  if(css_class) {
    groupGfx.addClass(css_class);
  }

  return groupGfx;
};

module.exports.addParallelDragMarker = function(p0, p1, parentGfx) {
  var groupGfx = parentGfx.group().addClass(DRAGMARKER_CLS),
      mid = Geometry.getMidPoint(p0, p1),
      orientation = Geometry.getOrientation(p0, p1);

  if (orientation === "horizontal") {
    groupGfx.rect(-8, -3, 16, 6).addClass('djs-visual');
    groupGfx.rect(-8, -10, 16, 20).addClass('djs-hit');
  
  } else if (orientation === "vertical") {
    groupGfx.rect(-3, -8, 6, 16).addClass('djs-visual');
    groupGfx.rect(-10, -8, 20, 16).addClass('djs-hit');
  }

  groupGfx.addClass(orientation);
  groupGfx.translate(mid.x, mid.y);
  return groupGfx;
};
