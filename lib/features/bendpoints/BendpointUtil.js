'use strict';

var Events = require('../../util/Event');

var BENDPOINT_CLS = module.exports.BENDPOINT_CLS = 'djs-bendpoint';

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

module.exports.addBendpoint = function(parentGfx) {
  var groupGfx = parentGfx.group().addClass(BENDPOINT_CLS);

  groupGfx.circle(0, 0, 4).addClass('djs-visual');
  groupGfx.circle(0, 0, 10).addClass('djs-hit');

  return groupGfx;
};