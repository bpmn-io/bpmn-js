import inherits from 'inherits-browser';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import { getParents } from 'diagram-js/lib/util/Elements';

import {
  filter
} from 'min-dash';

import {
  isAny
} from '../modeling/util/ModelingUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

/**
 * Registers element exclude filters for elements that currently do not support
 * distribution.
 *
 * @param {EventBus} eventBus
 */
export default function BpmnDistributeElements(eventBus) {
  RuleProvider.call(this, eventBus);
}

BpmnDistributeElements.$inject = [ 'eventBus' ];

inherits(BpmnDistributeElements, RuleProvider);

BpmnDistributeElements.prototype.init = function() {
  this.addRule('elements.distribute', function(context) {
    var elements = context.elements;

    elements = filter(elements, function(element) {
      var cannotDistribute = isAny(element, [
        'bpmn:Association',
        'bpmn:BoundaryEvent',
        'bpmn:DataInputAssociation',
        'bpmn:DataOutputAssociation',
        'bpmn:Lane',
        'bpmn:MessageFlow',
        'bpmn:SequenceFlow',
        'bpmn:TextAnnotation'
      ]);

      return !(element.labelTarget || cannotDistribute);
    });

    // filter out elements which are children of any of the selected elements
    elements = getParents(elements);

    if (elements.length < 3) {
      return false;
    }

    return elements;
  });
};
