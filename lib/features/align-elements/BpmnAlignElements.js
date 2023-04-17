import inherits from 'inherits-browser';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import { getParents } from 'diagram-js/lib/util/Elements';

import {
  filter
} from 'min-dash';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

/**
 * Rule provider for aligning BPMN elements.
 *
 * @param {EventBus} eventBus
 */
export default function BpmnAlignElements(eventBus) {
  RuleProvider.call(this, eventBus);
}

BpmnAlignElements.$inject = [ 'eventBus' ];

inherits(BpmnAlignElements, RuleProvider);

BpmnAlignElements.prototype.init = function() {
  this.addRule('elements.align', function(context) {
    var elements = context.elements;

    // filter out elements which cannot be aligned
    var filteredElements = filter(elements, function(element) {
      return !(element.waypoints || element.host || element.labelTarget);
    });

    // filter out elements which are children of any of the selected elements
    filteredElements = getParents(filteredElements);

    if (filteredElements.length < 2) {
      return false;
    }

    return filteredElements;
  });
};
