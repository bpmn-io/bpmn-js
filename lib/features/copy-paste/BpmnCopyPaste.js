import {
  getBusinessObject,
  getDi,
  is
} from '../../util/ModelUtil';

import {
  forEach,
  isArray,
  isUndefined,
  omit,
  reduce
} from 'min-dash';

import { isLabel } from '../../util/LabelUtil';

/**
 * @typedef {import('../modeling/BpmnFactory').default} BpmnFactory
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('./ModdleCopy').default} ModdleCopy
 */

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

var LOW_PRIORITY = 750;

/**
 * BPMN-specific copy & paste.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {EventBus} eventBus
 * @param {ModdleCopy} moddleCopy
 */
export default function BpmnCopyPaste(bpmnFactory, eventBus, moddleCopy) {

  function copy(bo, clone) {
    var targetBo = bpmnFactory.create(bo.$type);

    return moddleCopy.copyElement(bo, targetBo, null, clone);
  }

  eventBus.on('copyPaste.copyElement', LOW_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        element = context.element,
        businessObject = getBusinessObject(element);

    // do not copy business object + di for labels;
    // will be pulled from the referenced label target
    if (isLabel(element)) {
      return descriptor;
    }

    var businessObjectCopy = descriptor.businessObject = copy(businessObject, true);
    var diCopy = descriptor.di = copy(getDi(element), true);
    diCopy.bpmnElement = businessObjectCopy;

    copyProperties(businessObjectCopy, descriptor, 'name');
    copyProperties(diCopy, descriptor, 'isExpanded');

    // default sequence flow
    if (businessObject.default) {
      descriptor.default = businessObject.default.id;
    }
  });

  var referencesKey = '-bpmn-js-refs';

  function getReferences(cache) {
    return (cache[referencesKey] = cache[referencesKey] || {});
  }

  function setReferences(cache, references) {
    cache[referencesKey] = references;
  }

  function resolveReferences(descriptor, cache, references) {
    var businessObject = getBusinessObject(descriptor);

    // default sequence flows
    if (descriptor.default) {

      // relationship cannot be resolved immediately
      references[ descriptor.default ] = {
        element: businessObject,
        property: 'default'
      };
    }

    // boundary events
    if (descriptor.host) {

      // relationship can be resolved immediately
      getBusinessObject(descriptor).attachedToRef = getBusinessObject(cache[ descriptor.host ]);
    }

    return omit(references, reduce(references, function(array, reference, key) {
      var element = reference.element,
          property = reference.property;

      if (key === descriptor.id) {
        element.set(property, businessObject);

        array.push(descriptor.id);
      }

      return array;
    }, []));
  }

  eventBus.on('copyPaste.pasteElement', function(context) {
    var cache = context.cache,
        descriptor = context.descriptor,
        businessObject = descriptor.businessObject,
        di = descriptor.di;

    // wire existing di + businessObject for external label
    if (isLabel(descriptor)) {
      descriptor.businessObject = getBusinessObject(cache[ descriptor.labelTarget ]);
      descriptor.di = getDi(cache[ descriptor.labelTarget ]);

      return;
    }

    businessObject = descriptor.businessObject = copy(businessObject);

    di = descriptor.di = copy(di);
    di.bpmnElement = businessObject;

    copyProperties(descriptor, businessObject, [
      'isExpanded',
      'name'
    ]);

    descriptor.type = businessObject.$type;
  });

  // copy + paste processRef with participant

  eventBus.on('copyPaste.copyElement', LOW_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        element = context.element;

    if (!is(element, 'bpmn:Participant')) {
      return;
    }

    var participantBo = getBusinessObject(element);

    if (participantBo.processRef) {
      descriptor.processRef = copy(participantBo.processRef, true);
    }
  });

  eventBus.on('copyPaste.pasteElement', function(context) {
    var descriptor = context.descriptor,
        processRef = descriptor.processRef;

    if (processRef) {
      descriptor.processRef = copy(processRef);
    }
  });

  // resolve references

  eventBus.on('copyPaste.pasteElement', LOW_PRIORITY, function(context) {
    var cache = context.cache,
        descriptor = context.descriptor;

    // resolve references e.g. default sequence flow
    setReferences(
      cache,
      resolveReferences(descriptor, cache, getReferences(cache))
    );
  });

}


BpmnCopyPaste.$inject = [
  'bpmnFactory',
  'eventBus',
  'moddleCopy'
];