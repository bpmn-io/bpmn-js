'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var BaseElementFactory = require('diagram-js/lib/core/ElementFactory'),
    LabelUtil = require('../../util/LabelUtil');


/**
 * A bpmn-aware factory for diagram-js shapes
 */
function ElementFactory(bpmnFactory, moddle) {
  BaseElementFactory.call(this);

  this._bpmnFactory = bpmnFactory;
  this._moddle = moddle;
}

inherits(ElementFactory, BaseElementFactory);


ElementFactory.$inject = [ 'bpmnFactory', 'moddle' ];

module.exports = ElementFactory;

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;

ElementFactory.prototype.create = function(elementType, attrs) {

  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === 'label') {
    return this.baseCreate(elementType, assign({ type: 'label' }, LabelUtil.DEFAULT_LABEL_SIZE, attrs));
  }

  attrs = attrs || {};

  var businessObject = attrs.businessObject,
      size;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error('no shape type specified');
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

 if (!!attrs.isExpanded) {
   businessObject.di.isExpanded = attrs.isExpanded;
 }

 if (businessObject.$instanceOf('bpmn:ExclusiveGateway')) {
   businessObject.di.isMarkerVisible = true;
 }

 if (attrs._eventDefinitionType) {
   var eventDefinitions = businessObject.get('eventDefinitions') || [],
       newEventDefinition = this._moddle.create(attrs._eventDefinitionType);

   eventDefinitions.push(newEventDefinition);
   businessObject.eventDefinitions = eventDefinitions;
 }

 size = this._getDefaultSize(businessObject);

 attrs = assign({
   businessObject: businessObject,
   id: businessObject.id
 }, size, attrs);

 return this.baseCreate(elementType, attrs);
};


ElementFactory.prototype._getDefaultSize = function(semantic) {

  if (semantic.$instanceOf('bpmn:SubProcess')) {
    var isExpanded = semantic.di.isExpanded === true;

    if (isExpanded) {
      return { width: 350, height: 200 };
    } else {
      return { width: 100, height: 80 };
    }
  }

  if (semantic.$instanceOf('bpmn:Task')) {
    return { width: 100, height: 80 };
  }

  if (semantic.$instanceOf('bpmn:Gateway')) {
    return { width: 50, height: 50 };
  }

  if (semantic.$instanceOf('bpmn:Event')) {
    return { width: 36, height: 36 };
  }

  if (semantic.$instanceOf('bpmn:Participant')) {
    return { width: 600, height: 250 };
  }

  return { width: 100, height: 80 };
};


ElementFactory.prototype.createParticipantShape = function(collapsed) {

  var participantShape = this.createShape({ type: 'bpmn:Participant' });

  if (!collapsed) {
    participantShape.businessObject.processRef = this._bpmnFactory.create('bpmn:Process');
  }

  return participantShape;
};