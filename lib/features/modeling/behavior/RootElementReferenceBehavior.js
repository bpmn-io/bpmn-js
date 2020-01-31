import inherits from 'inherits';

import {
  find,
  isArray,
  matchPattern,
  some
} from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

import { hasEventDefinition } from '../../../util/DiUtil';

var LOW_PRIORITY = 500;


/**
 * Add referenced root elements (error, escalation, message, signal) if they don't exist.
 * Copy referenced root elements on copy & paste.
 */
export default function RootElementReferenceBehavior(
    bpmnjs, eventBus, injector, moddleCopy, bpmnFactory
) {
  injector.invoke(CommandInterceptor, this);

  function canHaveRootElementReference(element) {
    return isAny(element, [ 'bpmn:ReceiveTask', 'bpmn:SendTask' ]) ||
      hasAnyEventDefinition(element, [
        'bpmn:ErrorEventDefinition',
        'bpmn:EscalationEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:SignalEventDefinition'
      ]);
  }

  function hasRootElement(rootElement) {
    var definitions = bpmnjs.getDefinitions(),
        rootElements = definitions.get('rootElements');

    return !!find(rootElements, matchPattern({ id: rootElement.id }));
  }

  function getRootElementReferencePropertyName(eventDefinition) {
    if (is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
      return 'errorRef';
    } else if (is(eventDefinition, 'bpmn:EscalationEventDefinition')) {
      return 'escalationRef';
    } else if (is(eventDefinition, 'bpmn:MessageEventDefinition')) {
      return 'messageRef';
    } else if (is(eventDefinition, 'bpmn:SignalEventDefinition')) {
      return 'signalRef';
    }
  }

  function getRootElement(businessObject) {
    if (isAny(businessObject, [ 'bpmn:ReceiveTask', 'bpmn:SendTask' ])) {
      return businessObject.get('messageRef');
    }

    var eventDefinitions = businessObject.get('eventDefinitions'),
        eventDefinition = eventDefinitions[ 0 ];

    return eventDefinition.get(getRootElementReferencePropertyName(eventDefinition));
  }

  function setRootElement(businessObject, rootElement) {
    if (isAny(businessObject, [ 'bpmn:ReceiveTask', 'bpmn:SendTask' ])) {
      return businessObject.set('messageRef', rootElement);
    }

    var eventDefinitions = businessObject.get('eventDefinitions'),
        eventDefinition = eventDefinitions[ 0 ];

    return eventDefinition.set(getRootElementReferencePropertyName(eventDefinition), rootElement);
  }

  // create shape
  this.executed('shape.create', function(context) {
    var shape = context.shape;

    if (!canHaveRootElementReference(shape)) {
      return;
    }

    var businessObject = getBusinessObject(shape),
        rootElement = getRootElement(businessObject),
        rootElements;

    if (rootElement && !hasRootElement(rootElement)) {
      rootElements = bpmnjs.getDefinitions().get('rootElements');

      // add root element
      collectionAdd(rootElements, rootElement);

      context.addedRootElement = rootElement;
    }
  }, true);

  this.reverted('shape.create', function(context) {
    var addedRootElement = context.addedRootElement;

    if (!addedRootElement) {
      return;
    }

    var rootElements = bpmnjs.getDefinitions().get('rootElements');

    // remove root element
    collectionRemove(rootElements, addedRootElement);
  }, true);

  eventBus.on('copyPaste.copyElement', function(context) {
    var descriptor = context.descriptor,
        element = context.element;

    if (!canHaveRootElementReference(element)) {
      return;
    }

    var businessObject = getBusinessObject(element),
        rootElement = getRootElement(businessObject);

    if (rootElement) {
      descriptor.referencedRootElement = rootElement;
    }
  });

  eventBus.on('copyPaste.pasteElement', LOW_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        businessObject = descriptor.businessObject;

    if (!canHaveRootElementReference(businessObject)) {
      return;
    }

    var referencedRootElement = descriptor.referencedRootElement;

    if (!referencedRootElement) {
      return;
    }

    if (!hasRootElement(referencedRootElement)) {
      referencedRootElement = moddleCopy.copyElement(
        referencedRootElement,
        bpmnFactory.create(referencedRootElement.$type)
      );
    }

    setRootElement(businessObject, referencedRootElement);
  });
}

RootElementReferenceBehavior.$inject = [
  'bpmnjs',
  'eventBus',
  'injector',
  'moddleCopy',
  'bpmnFactory'
];

inherits(RootElementReferenceBehavior, CommandInterceptor);

// helpers //////////

function hasAnyEventDefinition(element, types) {
  if (!isArray(types)) {
    types = [ types ];
  }

  return some(types, function(type) {
    return hasEventDefinition(element, type);
  });
}