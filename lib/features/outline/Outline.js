'use strict';


var GraphicsUtil = require('../../util/GraphicsUtil');


/**
 * @class
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled
 * via CSS classes.
 *
 * @param {EventBus} events the event bus
 */
function Outline(events, styles) {

  var OUTLINE_OFFSET = 5;

  var OUTLINE_STYLE = styles.cls('djs-outline', [ 'no-fill' ]);

  function createOutline(gfx) {
    return gfx.rect(0, 0, 0, 0)
            .attr(OUTLINE_STYLE)
            .prependTo(gfx);
  }

  function updateOutline(outline, bbox) {

    outline.attr({
      x: bbox.x - OUTLINE_OFFSET,
      y: bbox.y - OUTLINE_OFFSET,
      width: bbox.width + OUTLINE_OFFSET * 2,
      height: bbox.height + OUTLINE_OFFSET * 2
    });
  }

  events.on('shape.added', function(event) {
    var element = event.element,
        gfx = event.gfx;

    var outline = createOutline(gfx);

    updateOutline(outline, GraphicsUtil.getBBox(gfx));
  });

  events.on('connection.change', function(event) {
    // TODO: update connection outline box
  });

  events.on('shape.change', function(event) {
    // TODO: update shape outline box
  });
}


Outline.$inject = ['eventBus', 'styles'];

module.exports = Outline;