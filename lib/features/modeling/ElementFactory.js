import {
  assign,
  forEach,
  isObject
} from 'min-dash';

import inherits from 'inherits';

import { is } from '../../util/ModelUtil';

import {
  isExpanded
} from '../../util/DiUtil';

import BaseElementFactory from 'diagram-js/lib/core/ElementFactory';

import {
  DEFAULT_LABEL_SIZE
} from '../../util/LabelUtil';


/**
 * A bpmn-aware factory for diagram-js shapes
 */
export default function ElementFactory(bpmnFactory, moddle, translate) {
  BaseElementFactory.call(this);

  this._bpmnFactory = bpmnFactory;
  this._moddle = moddle;
  this._translate = translate;
}

inherits(ElementFactory, BaseElementFactory);

ElementFactory.$inject = [
  'bpmnFactory',
  'moddle',
  'translate'
];

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;

ElementFactory.prototype.create = function(elementType, attrs) {

  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === 'label') {
    return this.baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs));
  }

  return this.createBpmnElement(elementType, attrs);
};

ElementFactory.prototype.createBpmnElement = function(elementType, attrs) {
  var size,
      translate = this._translate;

  attrs = attrs || {};

  var businessObject = attrs.businessObject;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error(translate('no shape type specified'));
    }

    businessObject = this._bpmnFactory.create(attrs.type);
  }

  if (!businessObject.di) {
    if (elementType === 'root') {
      businessObject.di = this._bpmnFactory.createDiPlane(businessObject, [], {
        id: businessObject.id + '_di'
      });
    } else
    if (elementType === 'connection') {
      businessObject.di = this._bpmnFactory.createDiEdge(businessObject, [], {
        id: businessObject.id + '_di'
      });
    } else {
      businessObject.di = this._bpmnFactory.createDiShape(businessObject, {}, {
        id: businessObject.id + '_di'
      });
    }
  }

  if (is(businessObject, 'bpmn:Group')) {
    attrs = assign({
      isFrame: true
    }, attrs);
  }

  if (attrs.di) {
    assign(businessObject.di, attrs.di);

    delete attrs.di;
  }

  applyAttributes(businessObject, attrs, [
    'processRef',
    'isInterrupting',
    'associationDirection',
    'isForCompensation'
  ]);

  if (attrs.isExpanded) {
    applyAttribute(businessObject.di, attrs, 'isExpanded');
  }

  if (is(businessObject, 'bpmn:ExclusiveGateway')) {
    businessObject.di.isMarkerVisible = true;
  }

  var eventDefinitions,
      newEventDefinition;

  if (attrs.eventDefinitionType) {
    eventDefinitions = businessObject.get('eventDefinitions') || [];
    newEventDefinition = this._bpmnFactory.create(attrs.eventDefinitionType, attrs.eventDefinitionAttrs);

    if (attrs.eventDefinitionType === 'bpmn:ConditionalEventDefinition') {
      newEventDefinition.condition = this._bpmnFactory.create('bpmn:FormalExpression');
    }

    eventDefinitions.push(newEventDefinition);

    newEventDefinition.$parent = businessObject;
    businessObject.eventDefinitions = eventDefinitions;

    delete attrs.eventDefinitionType;
  }

  size = this._getDefaultSize(businessObject);

  attrs = assign({
    businessObject: businessObject,
    id: businessObject.id
  }, size, attrs);

  return this.baseCreate(elementType, attrs);
};


ElementFactory.prototype._getDefaultSize = function(semantic) {

  if (is(semantic, 'bpmn:SubProcess')) {

    if (isExpanded(semantic)) {
      return { width: 350, height: 200 };
    } else {
      return { width: 100, height: 80 };
    }
  }

  if (is(semantic, 'bpmn:Task')) {
    return { width: 100, height: 80 };
  }

  if (is(semantic, 'bpmn:Gateway')) {
    return { width: 50, height: 50 };
  }

  if (is(semantic, 'bpmn:Event')) {
    return { width: 36, height: 36 };
  }

  if (is(semantic, 'bpmn:Participant')) {
    if (isExpanded(semantic)) {
      return { width: 600, height: 250 };
    } else {
      return { width: 400, height: 60 };
    }
  }

  if (is(semantic, 'bpmn:Lane')) {
    return { width: 400, height: 100 };
  }

  if (is(semantic, 'bpmn:DataObjectReference')) {
    return { width: 36, height: 50 };
  }

  if (is(semantic, 'bpmn:DataStoreReference')) {
    return { width: 50, height: 50 };
  }

  if (is(semantic, 'bpmn:TextAnnotation')) {
    return { width: 100, height: 30 };
  }

  if (is(semantic, 'bpmn:Group')) {
    return { width: 300, height: 300 };
  }

  return { width: 100, height: 80 };
};


/**
 * Create participant.
 *
 * @param {boolean|Object} [attrs] attrs
 *
 * @returns {djs.model.Shape}
 */
ElementFactory.prototype.createParticipantShape = function(attrs) {

  if (!isObject(attrs)) {
    attrs = { isExpanded: attrs };
  }

  attrs = assign({ type: 'bpmn:Participant' }, attrs || {});

  // participants are expanded by default
  if (attrs.isExpanded !== false) {
    attrs.processRef = this._bpmnFactory.create('bpmn:Process');
  }

  return this.createShape(attrs);
};


// helpers //////////////////////

/**
 * Apply attributes from a map to the given element,
 * remove attribute from the map on application.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {Array<string>} attributeNames name of attributes to apply
 */
function applyAttributes(element, attrs, attributeNames) {

  forEach(attributeNames, function(property) {
    if (attrs[property] !== undefined) {
      applyAttribute(element, attrs, property);
    }
  });
}

/**
 * Apply named property to element and drain it from the attrs
 * collection.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {string} attributeName to apply
 */
function applyAttribute(element, attrs, attributeName) {
  element[attributeName] = attrs[attributeName];

  delete attrs[attributeName];
}