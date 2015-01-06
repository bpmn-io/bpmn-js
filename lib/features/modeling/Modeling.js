'use strict';

var _ = require('lodash');

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling');

var UpdatePropertiesHandler = require('./cmd/UpdatePropertiesHandler');

/**
 * BPMN 2.0 modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, elementFactory, commandStack) {
  BaseModeling.call(this, eventBus, elementFactory, commandStack);
}

Modeling.prototype = Object.create(BaseModeling.prototype);

Modeling.$inject = [ 'eventBus', 'elementFactory', 'commandStack' ];

module.exports = Modeling;

Modeling.prototype.getHandlers = function() {
  var handlers = BaseModeling.prototype.getHandlers.call(this);

  handlers['element.updateProperties'] = UpdatePropertiesHandler;

  return handlers;
};


Modeling.prototype.updateLabel = function(element, newLabel) {
  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel
  });
};


Modeling.prototype.connect = function(source, target, attrs) {

  var sourceBo = source.businessObject,
      targetBo = target.businessObject;

  if (!attrs) {
    if (sourceBo.$instanceOf('bpmn:FlowNode') && targetBo.$instanceOf('bpmn:FlowNode')) {
      attrs = {
        type: 'bpmn:SequenceFlow'
      };
    } else {
      attrs = {
        type: 'bpmn:Association'
      };
    }
  }

  return this.createConnection(source, target, attrs, source.parent);
};


Modeling.prototype.updateProperties = function(element, properties) {
  this._commandStack.execute('element.updateProperties', {
    element: element,
    properties: properties
  });
};