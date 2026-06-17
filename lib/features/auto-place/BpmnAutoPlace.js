import { getNewShapePosition } from './BpmnAutoPlaceUtil.js';

/**
 * @typedef {import('diagram-js/lib/core/EventBus.js').default} EventBus
 * @typedef {import('diagram-js/lib/core/ElementRegistry.js').default} ElementRegistry
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