import { getLanesRoot } from '../util/LaneUtil';

import { is } from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

var HIGH_PRIORITY = 1500;

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
    'create.end',
    'shape.move.hover',
    'shape.move.move',
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

}

FixHoverBehavior.$inject = [
  'elementRegistry',
  'eventBus',
  'canvas'
];