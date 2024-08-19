import { getNewShapePosition } from './BpmnAutoPlaceUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 */

/**
 * BPMN auto-place behavior.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default function AutoPlace(eventBus, elementRegistry) {
  eventBus.on('autoPlace', function(context) {
    var shape = context.shape,
        source = context.source;

    return getNewShapePosition(source, shape, elementRegistry);
  });
}

AutoPlace.$inject = [ 'eventBus', 'elementRegistry' ];