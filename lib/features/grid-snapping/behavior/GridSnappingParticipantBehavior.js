import { is } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/grid-snapping/GridSnapping').default} GridSnapping
 */

var HIGHER_PRIORITY = 1750;

/**
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {GridSnapping} gridSnapping
 */
export default function GridSnappingParticipantBehavior(canvas, eventBus, gridSnapping) {
  eventBus.on([
    'create.start',
    'shape.move.start'
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    if (!is(shape, 'bpmn:Participant') ||
      !is(rootElement, 'bpmn:Process') ||
      !rootElement.children.length) {
      return;
    }

    var createConstraints = context.createConstraints;

    if (!createConstraints) {
      return;
    }

    shape.width = gridSnapping.snapValue(shape.width, { min: shape.width });
    shape.height = gridSnapping.snapValue(shape.height, { min: shape.height });
  });
}

GridSnappingParticipantBehavior.$inject = [
  'canvas',
  'eventBus',
  'gridSnapping'
];