import { getLanesRoot } from '../util/LaneUtil';

import { is } from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

var HIGH_PRIORITY = 1500;

/**
 * Ensure we correct hover targets to improve diagram interaction
 * during create and move.
 *
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 */
export default function FixHoverBehavior(elementRegistry, eventBus) {
  eventBus.on([
    'create.hover',
    'create.move',
    'create.end',
    'shape.move.hover',
    'shape.move.move',
    'shape.move.end'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        hover = event.hover;

    if (is(hover, 'bpmn:Lane') && !isAny(shape, [ 'bpmn:Lane', 'bpmn:Participant' ])) {
      event.hover = getLanesRoot(hover);
      event.hoverGfx = elementRegistry.getGraphics(event.hover);
    }
  });
}

FixHoverBehavior.$inject = [
  'elementRegistry',
  'eventBus'
];