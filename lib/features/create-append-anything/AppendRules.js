import {
  find,
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  is,
  isAny,
  getBusinessObject
} from '../../util/ModelUtil';

import {
  isLabel
} from '../../util/LabelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';


/**
 * Append anything modeling rules
 */
export default function AppendRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(AppendRules, RuleProvider);

AppendRules.$inject = [
  'eventBus'
];

AppendRules.prototype.init = function() {
  this.addRule('shape.append', function(context) {

    var source = context.element;

    const businessObject = getBusinessObject(source);

    if (isLabel(source)) {
      return false;
    }

    if (isAny(source, [
      'bpmn:EndEvent',
      'bpmn:Group',
      'bpmn:TextAnnotation',
      'bpmn:Lane',
      'bpmn:Participant',
      'bpmn:DataStoreReference',
      'bpmn:DataObjectReference'
    ])) {
      return false;
    }

    if (isConnection(source)) {
      return false;
    }

    if (is(source, 'bpmn:IntermediateThrowEvent') && hasEventDefinition(source, 'bpmn:LinkEventDefinition')) {
      return false;
    }

    if (is(source, 'bpmn:SubProcess') && businessObject.triggeredByEvent) {
      return false;
    }
  });

};


// helpers //////////////
function hasEventDefinition(element, eventDefinition) {
  var bo = getBusinessObject(element);

  return !!find(bo.eventDefinitions || [], function(definition) {
    return is(definition, eventDefinition);
  });
}

function isConnection(element) {
  return element.waypoints;
}