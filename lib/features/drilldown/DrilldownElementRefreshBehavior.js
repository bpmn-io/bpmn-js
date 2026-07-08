import { getShapeIdFromPlane, isPlane } from '../../util/DrilldownUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 */

/**
 * Refresh collapsed subprocess shapes when leaving drilldown.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default function DrilldownElementRefreshBehavior(eventBus, elementRegistry) {
  var currentRoot = null;

  eventBus.on('root.set', function(event) {
    var previousRoot = currentRoot,
        newRoot = event.element;

    currentRoot = newRoot;

    if (!previousRoot || previousRoot === newRoot || !isPlane(previousRoot)) {
      return;
    }

    var primaryShape = elementRegistry.get(getShapeIdFromPlane(previousRoot));

    if (!primaryShape || primaryShape === previousRoot) {
      return;
    }

    eventBus.fire('element.changed', { element: primaryShape });
  });

  eventBus.on('diagram.clear', function() {
    currentRoot = null;
  });
}

DrilldownElementRefreshBehavior.$inject = [ 'eventBus', 'elementRegistry' ];
