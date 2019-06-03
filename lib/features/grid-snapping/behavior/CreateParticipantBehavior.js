import { is } from '../../../util/ModelUtil';

var HIGHER_PRIORITY = 1750;


export default function CreateParticipantBehavior(canvas, eventBus, gridSnapping) {
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

CreateParticipantBehavior.$inject = [
  'canvas',
  'eventBus',
  'gridSnapping'
];