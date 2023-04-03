import { is } from '../../util/ModelUtil';

import inherits from 'inherits-browser';

import { forEach } from 'min-dash';

import AutoResizeProvider from 'diagram-js/lib/features/auto-resize/AutoResizeProvider';

/**
 * @typedef {import('diagram-js/lib/model/Types').Element} Element
 * @typedef {import('diagram-js/lib/model/Types').Shape} Shape
 */

/**
 * This module is a provider for automatically resizing parent BPMN elements
 */
export default function BpmnAutoResizeProvider(eventBus, modeling) {
  AutoResizeProvider.call(this, eventBus);

  this._modeling = modeling;
}

inherits(BpmnAutoResizeProvider, AutoResizeProvider);

BpmnAutoResizeProvider.$inject = [
  'eventBus',
  'modeling'
];


/**
 * Check if the given target can be expanded
 *
 * @param {Element[]} elements
 * @param {Shape} target
 *
 * @return {boolean}
 */
BpmnAutoResizeProvider.prototype.canResize = function(elements, target) {

  // do not resize plane elements:
  // root elements, collapsed sub-processes
  if (is(target.di, 'bpmndi:BPMNPlane')) {
    return false;
  }

  if (!is(target, 'bpmn:Participant') && !is(target, 'bpmn:Lane') && !(is(target, 'bpmn:SubProcess'))) {
    return false;
  }

  var canResize = true;

  forEach(elements, function(element) {

    if (is(element, 'bpmn:Lane') || element.labelTarget) {
      canResize = false;
      return;
    }
  });

  return canResize;
};
