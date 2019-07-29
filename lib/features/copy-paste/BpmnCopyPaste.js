import { getBusinessObject } from '../../util/ModelUtil';

import ModelCloneHelper from '../../util/model/ModelCloneHelper';

import {
  getProperties,
  IGNORED_PROPERTIES
} from '../../util/model/ModelCloneUtils';

import {
  filter,
  forEach,
  omit,
  reduce
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

var LOW_PRIORITY = 750;


export default function BpmnCopyPaste(bpmnFactory, bpmnRules, eventBus) {

  var helper = new ModelCloneHelper(eventBus, bpmnFactory);

  eventBus.on('element.copy', LOW_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        element = context.element;

    var businessObject = descriptor.oldBusinessObject = getBusinessObject(element);

    var colors = {};

    descriptor.type = element.type;

    setProperties(descriptor, businessObject.di, [ 'isExpanded' ]);

    setProperties(colors, businessObject.di, [ 'fill', 'stroke' ]);

    descriptor.colors = colors;

    if (isLabel(descriptor)) {
      return descriptor;
    }

    setProperties(descriptor, businessObject, [
      'processRef',
      'triggeredByEvent'
    ]);

    if (businessObject.default) {
      descriptor.default = businessObject.default.id;
    }
  });

  var references;

  function resolveReferences(descriptor) {
    var businessObject = getBusinessObject(descriptor);

    // default sequence flows
    if (descriptor.default) {
      references[ descriptor.default ] = {
        element: businessObject,
        property: 'default'
      };
    }

    references = omit(references, reduce(references, function(array, reference, key) {
      var element = reference.element,
          property = reference.property;

      if (key === descriptor.id) {
        element[ property ] = businessObject;

        array.push(descriptor.id);
      }

      return array;
    }, []));
  }

  eventBus.on('elements.paste', function() {
    references = {};
  });

  eventBus.on('element.paste', function(context) {
    var descriptor = context.descriptor,
        oldBusinessObject = descriptor.oldBusinessObject,
        cache = context.cache,
        newBusinessObject,
        source,
        target,
        canConnect;

    // do NOT copy business object if external label
    if (isLabel(descriptor)) {
      descriptor.businessObject = getBusinessObject(cache[ descriptor.labelTarget ]);

      return;
    }

    newBusinessObject = bpmnFactory.create(oldBusinessObject.$type);

    var properties = getProperties(oldBusinessObject.$descriptor);

    properties = filter(properties, function(property) {
      return IGNORED_PROPERTIES.indexOf(property.replace(/bpmn:/, '')) === -1;
    });

    descriptor.businessObject = helper.clone(oldBusinessObject, newBusinessObject, properties);

    // make sure that the correct type of connection is created
    if (isConnection(descriptor)) {
      source = cache[descriptor.source];
      target = cache[descriptor.target];

      if (source && target) {
        source = source.element;
        target = target.element;
      }

      canConnect = bpmnRules.canConnect(source, target);

      if (canConnect) {
        descriptor.type = canConnect.type;
      }
    }

    // resolve references references e.g. default sequence flow
    resolveReferences(descriptor);

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

    // TODO(philippfromme): un-comment once
    // https://github.com/bpmn-io/bpmn-js/commit/7b9a85ec5af902281a9090c17cd7dd1bd1addde6
    // is fixed

    // delete descriptor.oldBusinessObject
  });

}


BpmnCopyPaste.$inject = [
  'bpmnFactory',
  'bpmnRules',
  'eventBus'
];

// helpers //////////

function isConnection(element) {
  return !!element.waypoints;
}

function isLabel(element) {
  return !!element.labelTarget;
}