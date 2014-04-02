require('../core/EventBus');

require('../draw/Styles');

var Diagram = require('../Diagram'),
    SvgUtil = require('../util/SvgUtil');

var getVisual = SvgUtil.getVisual;

/**
 * @class
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled 
 * via CSS classes.
 * 
 * @param {EventBus} events the event bus
 */
function Outline(events, styles) {

  var OUTLINE_OFFSET = 10;

  var OUTLINE_STYLE = styles.cls('djs-outline', [ 'no-fill' ]);
  
  function createOutline(gfx) {
    return gfx.rect(0, 0, 0, 0)
            .attr(OUTLINE_STYLE)
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

Diagram.plugin('outline', [ 'eventBus', 'styles', Outline ]);

module.exports = Outline;