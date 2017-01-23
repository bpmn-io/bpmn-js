'use strict';

var ModelUtil = require('../../util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    is = ModelUtil.is;

var ModelCloneHelper = require('../../util/model/ModelCloneHelper');

var ModelCloneUtils = require('../../util/model/ModelCloneUtils'),
    getProperties = ModelCloneUtils.getProperties;

var IGNORED_PROPERTIES = ModelCloneUtils.IGNORED_PROPERTIES;

var filter = require('lodash/collection/filter'),
    forEach = require('lodash/collection/forEach');

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

function BpmnCopyPaste(bpmnFactory, eventBus, copyPaste, clipboard, moddle, canvas, bpmnRules) {

  var helper = new ModelCloneHelper(eventBus);

  copyPaste.registerDescriptor(function(element, descriptor) {
    var businessObject = getBusinessObject(element),
        newBusinessObject = bpmnFactory.create(businessObject.$type);

    var properties = getProperties(businessObject.$descriptor);

    properties = filter(properties, function(property) {
      return IGNORED_PROPERTIES.indexOf(property.replace(/bpmn:/, '')) === -1;
    });

    descriptor.businessObject = helper.clone(businessObject, newBusinessObject, properties);

    descriptor.type = element.type;

    setProperties(descriptor, businessObject.di, [ 'isExpanded' ]);

    if (element.type === 'label') {
      return descriptor;
    }

    setProperties(descriptor, businessObject, [
      'type',
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
        businessObject,
        source,
        target,
        canConnect;

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

    businessObject = descriptor.businessObject;

    // remove the id or else we cannot paste multiple times
    delete businessObject.id;

    // assign an ID
    bpmnFactory._ensureId(businessObject);

    if (descriptor.type === 'bpmn:Participant' && descriptor.processRef) {
      descriptor.processRef = businessObject.processRef = bpmnFactory.create('bpmn:Process');
    }

    setProperties(businessObject, descriptor, [
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
  'moddle',
  'canvas',
  'bpmnRules'
];

module.exports = BpmnCopyPaste;
