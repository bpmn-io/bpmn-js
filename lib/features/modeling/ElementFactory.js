'use strict';

var _ = require('lodash');

var BaseElementFactory = require('diagram-js/lib/core/ElementFactory');


/**
 * A bpmn-aware factory for diagram-js shapes
 */
function ElementFactory(bpmnFactory) {
  BaseElementFactory.call(this);

  this._bpmnFactory = bpmnFactory;
}

ElementFactory.prototype = Object.create(BaseElementFactory.prototype);

module.exports = ElementFactory;


ElementFactory.prototype.createWithBpmn = function(elementType, attrs) {

  attrs = attrs || {};

  var businessObject = attrs.businessObject;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error('no shape type specified');
    }

    businessObject = this._bpmnFactory.create(attrs.type);

    _.extend(attrs, {
      businessObject: businessObject,
      id: businessObject.id
    });
  }

  return this.create(elementType, attrs);
};

ElementFactory.prototype.createRoot = function(attrs) {
  return this.createWithBpmn('root', attrs);
};

ElementFactory.prototype.createLabel = function(attrs) {
  return this.create('label', _.extend({ type: 'label' }, attrs));
};

ElementFactory.prototype.createShape = function(attrs) {
  return this.createWithBpmn('shape', attrs);
};

ElementFactory.prototype.createConnection = function(attrs) {
  return this.createWithBpmn('connection', attrs);
};