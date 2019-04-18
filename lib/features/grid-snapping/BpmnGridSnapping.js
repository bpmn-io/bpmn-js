import { isAny } from '../modeling/util/ModelingUtil';

export default function BpmnGridSnapping(eventBus) {
  eventBus.on([
    'create.init',
    'shape.move.init'
  ], function(event) {
    var context = event.context,
        shape = event.shape;

    if (isAny(shape, [
      'bpmn:Participant',
      'bpmn:SubProcess',
      'bpmn:TextAnnotation'
    ])) {
      if (!context.gridSnappingContext) {
        context.gridSnappingContext = {};
      }

      context.gridSnappingContext.snapLocation = 'top-left';
    }
  });
}

BpmnGridSnapping.$inject = [ 'eventBus' ];