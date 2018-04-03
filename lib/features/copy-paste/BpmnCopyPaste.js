import {
  getBusinessObject,
  is
} from '../../util/ModelUtil';

import ModelCloneHelper from '../../util/model/ModelCloneHelper';

import {
  getProperties,
  IGNORED_PROPERTIES
} from '../../util/model/ModelCloneUtils';

import {
  filter,
  forEach
} from 'min-dash';

function setProperties(descriptor, data, properties) {
  forEach(properties, function(property) {
    if (data[property] !== undefined) {
      descriptor[property] = data[property];
    }
  });
}

function removeProperties(element, properties) {
  forEach(properties, function(prop) {
    if (element[prop]) {
      delete element[prop];
    }
  });
}

export default function BpmnCopyPaste(
    bpmnFactory, eventBus, copyPaste,
    clipboard, canvas, bpmnRules) {

  var helper = new ModelCloneHelper(eventBus, bpmnFactory);

  copyPaste.registerDescriptor(function(element, descriptor) {
    var businessObject = descriptor.oldBusinessObject = getBusinessObject(element);

    var colors = {};

    descriptor.type = element.type;

    setProperties(descriptor, businessObject.di, [ 'isExpanded' ]);

    setProperties(colors, businessObject.di, [ 'fill', 'stroke' ]);

    descriptor.colors = colors;

    if (element.type === 'label') {
      return descriptor;
    }

    setProperties(descriptor, businessObject, [
      'processRef',
      'triggeredByEvent'
    ]);

    if (businessObject.default) {
      descriptor.default = businessObject.default.id;
    }

    return descriptor;
  });

  eventBus.on('element.paste', function(context) {
    var descriptor = context.descriptor,
        createdElements = context.createdElements,
        parent = descriptor.parent,
        rootElement = canvas.getRootElement(),
        oldBusinessObject = descriptor.oldBusinessObject,
        newBusinessObject,
        source,
        target,
        canConnect;

    newBusinessObject = bpmnFactory.create(oldBusinessObject.$type);

    var properties = getProperties(oldBusinessObject.$descriptor);

    properties = filter(properties, function(property) {
      return IGNORED_PROPERTIES.indexOf(property.replace(/bpmn:/, '')) === -1;
    });

    descriptor.businessObject = helper.clone(oldBusinessObject, newBusinessObject, properties);

    if (descriptor.type === 'label') {
      return;
    }

    if (is(parent, 'bpmn:Process')) {
      descriptor.parent = is(rootElement, 'bpmn:Collaboration') ? rootElement : parent;
    }

    if (descriptor.type === 'bpmn:DataOutputAssociation' ||
        descriptor.type === 'bpmn:DataInputAssociation' ||
        descriptor.type === 'bpmn:MessageFlow') {
      descriptor.parent = rootElement;
    }

    if (is(parent, 'bpmn:Lane')) {
      descriptor.parent = parent.parent;
    }

    // make sure that the correct type of connection is created
    if (descriptor.waypoints) {
      source = createdElements[descriptor.source];
      target = createdElements[descriptor.target];

      if (source && target) {
        source = source.element;
        target = target.element;
      }

      canConnect = bpmnRules.canConnect(source, target);

      if (canConnect) {
        descriptor.type = canConnect.type;
      }
    }

    // remove the id or else we cannot paste multiple times
    delete newBusinessObject.id;

    // assign an ID
    bpmnFactory._ensureId(newBusinessObject);

    if (descriptor.type === 'bpmn:Participant' && descriptor.processRef) {
      descriptor.processRef = newBusinessObject.processRef = bpmnFactory.create('bpmn:Process');
    }

    setProperties(newBusinessObject, descriptor, [
      'isExpanded',
      'triggeredByEvent'
    ]);

    removeProperties(descriptor, [
      'triggeredByEvent'
    ]);
  });

}


BpmnCopyPaste.$inject = [
  'bpmnFactory',
  'eventBus',
  'copyPaste',
  'clipboard',
  'canvas',
  'bpmnRules'
];