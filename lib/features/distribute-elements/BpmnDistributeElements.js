import {
  filter
} from 'min-dash';

import {
  isAny
} from '../modeling/util/ModelingUtil';


/**
 * Registers element exclude filters for elements that
 * currently do not support distribution.
 */
export default function BpmnDistributeElements(distributeElements) {

  distributeElements.registerFilter(function(elements) {
    return filter(elements, function(element) {
      var cannotDistribute = isAny(element, [
        'bpmn:Association',
        'bpmn:BoundaryEvent',
        'bpmn:DataInputAssociation',
        'bpmn:DataOutputAssociation',
        'bpmn:Lane',
        'bpmn:MessageFlow',
        'bpmn:Participant',
        'bpmn:SequenceFlow',
        'bpmn:TextAnnotation'
      ]);

      return !(element.labelTarget || cannotDistribute);
    });
  });
}

BpmnDistributeElements.$inject = [ 'distributeElements' ];