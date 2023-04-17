import {
  assign,
  forEach,
  isDefined,
  isObject,
  omit
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  getBusinessObject,
  getDi,
  is
} from '../../util/ModelUtil';

import {
  isAny
} from '../modeling/util/ModelingUtil';

import {
  isExpanded
} from '../../util/DiUtil';

import BaseElementFactory from 'diagram-js/lib/core/ElementFactory';

import {
  DEFAULT_LABEL_SIZE
} from '../../util/LabelUtil';

import {
  ensureCompatDiRef
} from '../../util/CompatibilityUtil';

/**
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 *
 * @typedef {import('diagram-js/lib/util/Types').Dimensions} Dimensions
 *
 * @typedef {import('./BpmnFactory').default} BpmnFactory
 *
 * @typedef {import('../../model/Types').BpmnAttributes} BpmnAttributes
 * @typedef {import('../../model/Types').BpmnConnection} BpmnConnection
 * @typedef {import('../../model/Types').BpmnElement} BpmnElement
 * @typedef {import('../../model/Types').BpmnLabel} BpmnLabel
 * @typedef {import('../../model/Types').BpmnRoot} BpmnRoot
 * @typedef {import('../../model/Types').BpmnShape} BpmnShape
 * @typedef {import('../../model/Types').Moddle} Moddle
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 */

/**
 * A BPMN-aware factory for diagram elements.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {Moddle} moddle
 * @param {Translate} translate
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

ElementFactory.prototype._baseCreate = BaseElementFactory.prototype.create;

/**
 * Create a root element.
 *
 * @overlord
 * @param {'root'} type
 * @param {Partial<BpmnRoot> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnRoot}
 */

/**
 * Create a shape.
 *
 * @overlord
 * @param {'shape'} type
 * @param {Partial<BpmnShape> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnShape}
 */

/**
 * Create a connection.
 *
 * @overlord
 * @param {'connection'} type
 * @param {Partial<BpmnConnection> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnConnection}
 */

/**
 * Create a label.
 *
 * @param {'label'} type
 * @param {Partial<BpmnLabel> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnLabel}
 */
ElementFactory.prototype.create = function(elementType, attrs) {

  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === 'label') {
    var di = attrs.di || this._bpmnFactory.createDiLabel();
    return this._baseCreate(elementType, assign({ type: 'label', di: di }, DEFAULT_LABEL_SIZE, attrs));
  }

  return this.createBpmnElement(elementType, attrs);
};

/**
 * Create a BPMN root element.
 *
 * @overlord
 * @param {'root'} elementType
 * @param {Partial<BpmnRoot> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnRoot}
 */

/**
 * Create a BPMN shape.
 *
 * @overlord
 * @param {'shape'} elementType
 * @param {Partial<BpmnShape> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnShape}
 */

/**
 * Create a BPMN connection.
 *
 * @param {'connection'} elementType
 * @param {Partial<BpmnConnection> & Partial<BpmnAttributes>} [attrs]
 * @return {BpmnConnection}
 */
ElementFactory.prototype.createBpmnElement = function(elementType, attrs) {
  var size,
      translate = this._translate;

  attrs = assign({}, attrs || {});

  var businessObject = attrs.businessObject,
      di = attrs.di;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error(translate('no shape type specified'));
    }

    businessObject = this._bpmnFactory.create(attrs.type);

    ensureCompatDiRef(businessObject);
  }

  if (!isModdleDi(di)) {
    var diAttrs = assign(
      {},
      di || {},
      { id: businessObject.id + '_di' }
    );

    if (elementType === 'root') {
      di = this._bpmnFactory.createDiPlane(businessObject, diAttrs);
    } else
    if (elementType === 'connection') {
      di = this._bpmnFactory.createDiEdge(businessObject, diAttrs);
    } else {
      di = this._bpmnFactory.createDiShape(businessObject, diAttrs);
    }
  }

  if (is(businessObject, 'bpmn:Group')) {
    attrs = assign({
      isFrame: true
    }, attrs);
  }

  attrs = applyAttributes(businessObject, attrs, [
    'processRef',
    'isInterrupting',
    'associationDirection',
    'isForCompensation'
  ]);

  if (attrs.isExpanded) {
    attrs = applyAttribute(di, attrs, 'isExpanded');
  }

  if (is(businessObject, 'bpmn:SubProcess')) {
    attrs.collapsed = !isExpanded(businessObject, di);
  }

  if (is(businessObject, 'bpmn:ExclusiveGateway')) {
    di.isMarkerVisible = true;
  }

  if (isDefined(attrs.triggeredByEvent)) {
    businessObject.triggeredByEvent = attrs.triggeredByEvent;
    delete attrs.triggeredByEvent;
  }

  if (isDefined(attrs.cancelActivity)) {
    businessObject.cancelActivity = attrs.cancelActivity;
    delete attrs.cancelActivity;
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

  size = this.getDefaultSize(businessObject, di);

  attrs = assign({
    id: businessObject.id
  }, size, attrs, {
    businessObject: businessObject,
    di: di
  });

  return this._baseCreate(elementType, attrs);
};

/**
 * Get the default size of a diagram element.
 *
 * @param {BpmnElement} element The element.
 * @param {ModdleElement} di The DI.
 *
 * @returns {Dimensions} Default width and height of the element.
 */
ElementFactory.prototype.getDefaultSize = function(element, di) {

  var bo = getBusinessObject(element);
  di = di || getDi(element);

  if (is(bo, 'bpmn:SubProcess')) {
    if (isExpanded(bo, di)) {
      return { width: 350, height: 200 };
    } else {
      return { width: 100, height: 80 };
    }
  }

  if (is(bo, 'bpmn:Task')) {
    return { width: 100, height: 80 };
  }

  if (is(bo, 'bpmn:Gateway')) {
    return { width: 50, height: 50 };
  }

  if (is(bo, 'bpmn:Event')) {
    return { width: 36, height: 36 };
  }

  if (is(bo, 'bpmn:Participant')) {
    if (isExpanded(bo, di)) {
      return { width: 600, height: 250 };
    } else {
      return { width: 400, height: 60 };
    }
  }

  if (is(bo, 'bpmn:Lane')) {
    return { width: 400, height: 100 };
  }

  if (is(bo, 'bpmn:DataObjectReference')) {
    return { width: 36, height: 50 };
  }

  if (is(bo, 'bpmn:DataStoreReference')) {
    return { width: 50, height: 50 };
  }

  if (is(bo, 'bpmn:TextAnnotation')) {
    return { width: 100, height: 30 };
  }

  if (is(bo, 'bpmn:Group')) {
    return { width: 300, height: 300 };
  }

  return { width: 100, height: 80 };
};


/**
 * Create participant.
 *
 * @param {boolean|Partial<BpmnShape> & Partial<BpmnAttributes>} [attrs] Attributes or whether the participant is
 * expanded.
 *
 * @returns {BpmnShape} The created participant.
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
 * @param {Element} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {string[]} attributeNames name of attributes to apply
 *
 * @return {Object} changed attrs
 */
function applyAttributes(element, attrs, attributeNames) {

  forEach(attributeNames, function(property) {
    attrs = applyAttribute(element, attrs, property);
  });

  return attrs;
}

/**
 * Apply named property to element and drain it from the attrs
 * collection.
 *
 * @param {Element} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {string} attributeName to apply
 *
 * @return {Object} changed attrs
 */
function applyAttribute(element, attrs, attributeName) {
  if (attrs[attributeName] === undefined) {
    return attrs;
  }

  element[attributeName] = attrs[attributeName];

  return omit(attrs, [ attributeName ]);
}


function isModdleDi(element) {
  return isAny(element, [
    'bpmndi:BPMNShape',
    'bpmndi:BPMNEdge',
    'bpmndi:BPMNDiagram',
    'bpmndi:BPMNPlane',
  ]);
}