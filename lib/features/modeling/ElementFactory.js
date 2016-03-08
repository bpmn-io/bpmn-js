'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var is = require('../../util/ModelUtil').is;

var isExpanded = require('../../util/DiUtil').isExpanded;

var BaseElementFactory = require('diagram-js/lib/core/ElementFactory'),
    LabelUtil = require('../../util/LabelUtil');

/**
 * A bpmn-aware factory for diagram-js shapes
 */
function ElementFactory(bpmnFactory, moddle, translate) {
  BaseElementFactory.call(this);

  this._bpmnFactory = bpmnFactory;
  this._moddle = moddle;
  this._translate = translate;
}

inherits(ElementFactory, BaseElementFactory);


ElementFactory.$inject = [ 'bpmnFactory', 'moddle', 'translate' ];

module.exports = ElementFactory;

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;

ElementFactory.prototype.create = function(elementType, attrs) {
  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === 'label') {
    return this.baseCreate(elementType, assign({ type: 'label' }, LabelUtil.DEFAULT_LABEL_SIZE, attrs));
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

  if (attrs.processRef) {
    businessObject.processRef = attrs.processRef;
  }

  if (attrs.isExpanded) {
    businessObject.di.isExpanded = attrs.isExpanded;
  }

  if (is(businessObject, 'bpmn:ExclusiveGateway')) {
    businessObject.di.isMarkerVisible = true;
  }

  if (attrs.isInterrupting === false) {
    businessObject.isInterrupting = false;
  }

  if (attrs.associationDirection) {
    businessObject.associationDirection = attrs.associationDirection;
  }

  var eventDefinitions,
      newEventDefinition;

  if (attrs.eventDefinitionType) {
    eventDefinitions = businessObject.get('eventDefinitions') || [];
    newEventDefinition = this._moddle.create(attrs.eventDefinitionType);

    eventDefinitions.push(newEventDefinition);

    newEventDefinition.$parent = businessObject;
    businessObject.eventDefinitions = eventDefinitions;
  }

  if (attrs.isForCompensation) {
    businessObject.isForCompensation = true;
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
    if (!isExpanded(semantic)) {
      return { width: 400, height: 100 };
    } else {
      return { width: 600, height: 250 };
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

  return { width: 100, height: 80 };
};


ElementFactory.prototype.createParticipantShape = function(collapsed) {

  var attrs = { type: 'bpmn:Participant' };

  if (!collapsed) {
    attrs.processRef = this._bpmnFactory.create('bpmn:Process');
  }

  return this.createShape(attrs);
};
