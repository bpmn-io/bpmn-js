import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  classes as svgClasses
} from 'tiny-svg';


var EXTENDED_HIT = 'djs-hit-extended';

/**
 * BPMN specific detach event behavior
 */
export default function StickyBoundaryEventBehavior(eventBus, elementRegistry) {

  CommandInterceptor.call(this, eventBus);

  var hostGfx = null;

  eventBus.on([
    'shape.move.init'
  ], function(event) {
    var shape = event.shape;

    if (shape && shape.host) {
      hostGfx = elementRegistry.getGraphics(shape.host);

      svgClasses(hostGfx).add(EXTENDED_HIT);
    }
  });

  eventBus.on([
    'shape.move.hover'
  ], function(event) {
    if (hostGfx && event.hoverGfx !== hostGfx) {
      cleanUp();
    }
  });

  eventBus.on([
    'shape.move.cleanup'
  ], function() {
    if (hostGfx) {
      cleanUp();
    }
  });

  function cleanUp() {
    svgClasses(hostGfx).remove(EXTENDED_HIT);

    hostGfx = null;
  }
}

StickyBoundaryEventBehavior.$inject = [
  'eventBus',
  'elementRegistry'
];

inherits(StickyBoundaryEventBehavior, CommandInterceptor);
