import { getLanesRoot } from '../util/LaneUtil';

import { is } from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

/**
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 */

var HIGH_PRIORITY = 1500;
var HIGHEST_PRIORITY = 2000;


/**
 * Correct hover targets in certain situations to improve diagram interaction.
 *
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function FixHoverBehavior(elementRegistry, eventBus, canvas) {

  eventBus.on([
    'create.hover',
    'create.move',
    'create.out',
    'create.end',
    'shape.move.hover',
    'shape.move.move',
    'shape.move.out',
    'shape.move.end'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape || event.shape,
        hover = event.hover;

    // ensure elements are not dropped onto a bpmn:Lane but onto
    // the underlying bpmn:Participant
    if (is(hover, 'bpmn:Lane') && !isAny(shape, [ 'bpmn:Lane', 'bpmn:Participant' ])) {
      event.hover = getLanesRoot(hover);
      event.hoverGfx = elementRegistry.getGraphics(event.hover);
    }

    var rootElement = canvas.getRootElement();

    // ensure bpmn:Group and label elements are dropped
    // always onto the root
    if (hover !== rootElement && (shape.labelTarget || is(shape, 'bpmn:Group'))) {
      event.hover = rootElement;
      event.hoverGfx = elementRegistry.getGraphics(event.hover);
    }
  });

  eventBus.on([
    'connect.hover',
    'connect.out',
    'connect.end',
    'connect.cleanup',
    'global-connect.hover',
    'global-connect.out',
    'global-connect.end',
    'global-connect.cleanup'
  ], HIGH_PRIORITY, function(event) {
    var hover = event.hover;

    // ensure connections start/end on bpmn:Participant,
    // not the underlying bpmn:Lane
    if (is(hover, 'bpmn:Lane')) {
      event.hover = getLanesRoot(hover) || hover;
      event.hoverGfx = elementRegistry.getGraphics(event.hover);
    }
  });


  eventBus.on([
    'bendpoint.move.hover'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        hover = event.hover,
        type = context.type;

    // ensure reconnect start/end on bpmn:Participant,
    // not the underlying bpmn:Lane
    if (is(hover, 'bpmn:Lane') && /reconnect/.test(type)) {
      event.hover = getLanesRoot(hover) || hover;
      event.hoverGfx = elementRegistry.getGraphics(event.hover);
    }
  });


  eventBus.on([
    'connect.start'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        start = context.start;

    // ensure connect start on bpmn:Participant,
    // not the underlying bpmn:Lane
    if (is(start, 'bpmn:Lane')) {
      context.start = getLanesRoot(start) || start;
    }
  });


  // allow movement of participants from lanes
  eventBus.on('shape.move.start', HIGHEST_PRIORITY, function(event) {
    var shape = event.shape;

    if (is(shape, 'bpmn:Lane')) {
      event.shape = getLanesRoot(shape) || shape;
    }
  });

}

FixHoverBehavior.$inject = [
  'elementRegistry',
  'eventBus',
  'canvas'
];