import { getNewShapePosition } from './BpmnAutoPlaceUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

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