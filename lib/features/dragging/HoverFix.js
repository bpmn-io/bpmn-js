'use strict';

var domClosest = require('min-dom/lib/closest');

var Snap = require('../../../vendor/snapsvg');

var Event = require('../../util/Event');

function getGfx(target) {
  var node = domClosest(target, 'svg, .djs-element', true);
  return node && new Snap(node);
}


/**
 * Browsers may swallow the hover event if users are to
 * fast with the mouse.
 *
 * @see http://stackoverflow.com/questions/7448468/why-cant-i-reliably-capture-a-mouseout-event
 *
 * The fix implemented in this component ensure that we
 * have a hover state after a successive drag.move event.
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {ElementRegistry} elementRegistry
 */
function HoverFix(eventBus, dragging, elementRegistry) {

  var self = this;

  // we wait for a specific sequence of events before
  // emitting a fake drag.hover event.
  //
  // Event Sequence:
  //
  // drag.start
  // drag.move
  // drag.move >> ensure we are hovering
  //
  eventBus.on('drag.start', function(event) {

    eventBus.once('drag.move', function() {

      eventBus.once('drag.move', function(event) {

        self.ensureHover(event);
      });
    });
  });

  /**
   * Make sure we are god damn hovering!
   *
   * @param {Event} dragging event
   */
  this.ensureHover = function(event) {

    if (event.hover) {
      return;
    }

    var originalEvent = event.originalEvent,
        position,
        target,
        element,
        gfx;

    if (!(originalEvent instanceof MouseEvent)) {
      return;
    }

    position = Event.toPoint(originalEvent);

    // damn expensive operation, ouch!
    target = document.elementFromPoint(position.x, position.y);

    gfx = getGfx(target);

    if (gfx) {
      element = elementRegistry.get(gfx);

      dragging.hover({ element: element, gfx: gfx });
    }
  };

}

HoverFix.$inject = [ 'eventBus', 'dragging', 'elementRegistry' ];

module.exports = HoverFix;