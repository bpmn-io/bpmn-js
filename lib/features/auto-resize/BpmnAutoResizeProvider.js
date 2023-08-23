import { is } from '../../util/ModelUtil';

import { isLabel } from '../../util/LabelUtil';

import inherits from 'inherits-browser';

import { forEach } from 'min-dash';

import AutoResizeProvider from 'diagram-js/lib/features/auto-resize/AutoResizeProvider';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 *
 * @typedef {import('../../model/Types').Shape} Shape
 */

/**
 * BPMN-specific provider for automatic resizung.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
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
 * BPMN-specific check whether given elements can be resized.
 *
 * @param {Shape[]} elements
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

    if (is(element, 'bpmn:Lane') || isLabel(element)) {
      canResize = false;
      return;
    }
  });

  return canResize;
};
