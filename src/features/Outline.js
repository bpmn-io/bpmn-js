require('../core/Canvas');
require('../core/Events');

var Diagram = require('../Diagram'),
    svgUtil = require('../util/svgUtil');

var getVisual = svgUtil.getVisual;

/**
 * @class
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled 
 * via CSS classes.
 * 
 * @param {Events} events the event bus
 */
function Outline(events, canvas) {

  var OUTLINE_OFFSET = 10;

  var paper = canvas.getContext();

  function createOutline(gfx) {
    return paper.rect(0, 0, 0, 0)
            .attr('class', 'djs-outline')
            .prependTo(gfx);
  }

  function updateOutline(outline, bbox) {

    outline.attr({
      x: - OUTLINE_OFFSET,
      y: - OUTLINE_OFFSET,
      width: bbox.width + OUTLINE_OFFSET * 2,
      height: bbox.height + OUTLINE_OFFSET * 2
    });
  }

  events.on('shape.added', function(event) {
    var element = event.element,
        gfx = event.gfx;

    var outline = createOutline(gfx);

    updateOutline(outline, getVisual(gfx).getBBox(true));
  });

  events.on('connection.change', function(event) {
    // TODO: update connection outline box
  });

  events.on('shape.change', function(event) {
    // TODO: update shape outline box
  });
}

Diagram.plugin('outline', [ 'events', 'canvas', Outline ]);

module.exports = Outline;