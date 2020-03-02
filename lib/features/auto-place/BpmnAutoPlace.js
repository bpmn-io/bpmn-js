import { getNewShapePosition } from './BpmnAutoPlaceUtil';


/**
 * BPMN auto-place behavior.
 *
 * @param {EventBus} eventBus
 */
export default function AutoPlace(eventBus) {
  eventBus.on('autoPlace', function(context) {
    var shape = context.shape,
        source = context.source;

    return getNewShapePosition(source, shape);
  });
}

AutoPlace.$inject = [ 'eventBus' ];