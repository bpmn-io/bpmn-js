import CopyModelElementUtil from '../../util/CopyModelElementUtil';

import { getBusinessObject } from '../../util/ModelUtil';

import {
  forEach,
  isArray,
  isUndefined,
  omit,
  reduce
} from 'min-dash';

function copyProperties(source, target, properties) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  forEach(properties, function(property) {
    if (!isUndefined(source[property])) {
      target[property] = source[property];
    }
  });
}

function removeProperties(element, properties) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  forEach(properties, function(property) {
    if (element[property]) {
      delete element[property];
    }
  });
}

var LOW_PRIORITY = 750;


export default function BpmnCopyPaste(bpmnFactory, eventBus, injector) {

  var copyModelElementUtil = injector.instantiate(CopyModelElementUtil);

  eventBus.on('element.copy', LOW_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        element = context.element;

    var businessObject = descriptor.oldBusinessObject = getBusinessObject(element);

    descriptor.type = element.type;

    descriptor.di = {};

    // fill and stroke will be set to DI
    copyProperties(businessObject.di, descriptor.di, [
      'fill',
      'stroke'
    ]);

    copyProperties(businessObject.di, descriptor, 'isExpanded');

    if (isLabel(descriptor)) {
      return descriptor;
    }

    // default sequence flow
    if (businessObject.default) {
      descriptor.default = businessObject.default.id;
    }
  });

  var references;

  // TODO: move to CopyModelElementUtil
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

    descriptor.businessObject = copyModelElementUtil.copyElement(
      oldBusinessObject,
      newBusinessObject
    );

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

    // resolve references e.g. default sequence flow
    resolveReferences(descriptor);

    if (descriptor.type === 'bpmn:Participant' && descriptor.processRef) {
      descriptor.processRef = newBusinessObject.processRef = bpmnFactory.create('bpmn:Process');
    }

    copyProperties(descriptor, newBusinessObject, 'isExpanded');

    removeProperties(descriptor, 'oldBusinessObject');
  });

}


BpmnCopyPaste.$inject = [
  'bpmnFactory',
  'eventBus',
  'injector'
];

// helpers //////////

function isConnection(element) {
  return !!element.waypoints;
}

function isLabel(element) {
  return !!element.labelTarget;
}