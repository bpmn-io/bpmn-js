import inherits from 'inherits';

import {
  forEach
} from 'min-dash';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';


export default function CopyPasteBehavior(eventBus, modeling, canvas) {

  CommandInterceptor.call(this, eventBus);

  this.preExecute('elements.paste', 1500, function(context) {
    var topParent = context.topParent;

    // always grab the latest root
    if (!topParent.parent) {
      context.topParent = canvas.getRootElement();
    }

    if (is(topParent, 'bpmn:Lane')) {
      do {
        // unwrap Lane -> LaneSet -> (Lane | FlowElementsContainer)
        topParent = context.topParent = topParent.parent;

      } while (is(topParent, 'bpmn:Lane') || !is(topParent, 'bpmn:Participant'));
    }
  }, true);

  this.postExecute('elements.paste', function(context) {

    var tree = context.tree,
        createdElements = tree.createdElements;

    forEach(createdElements, function(data) {
      var element = data.element,
          businessObject = element.businessObject,
          descriptor = data.descriptor,
          defaultFlow;

      if ((is(businessObject, 'bpmn:ExclusiveGateway') || is(businessObject, 'bpmn:InclusiveGateway') ||
           is(businessObject, 'bpmn:Activity')) && descriptor.default) {

        defaultFlow = createdElements[descriptor.default];

        // if the default flow wasn't created, means that it wasn't copied
        if (defaultFlow) {
          defaultFlow = defaultFlow.element;
        } else {
          defaultFlow = undefined;
        }

        delete element.default;

        modeling.updateProperties(element, { default: defaultFlow });
      }
    });
  }, true);
}


CopyPasteBehavior.$inject = [
  'eventBus',
  'modeling',
  'canvas'
];

inherits(CopyPasteBehavior, CommandInterceptor);