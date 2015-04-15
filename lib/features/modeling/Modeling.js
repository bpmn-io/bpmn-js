'use strict';

var inherits = require('inherits');

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling');

var UpdatePropertiesHandler = require('./cmd/UpdatePropertiesHandler'),
    UpdateCanvasRootHandler = require('./cmd/UpdateCanvasRootHandler');


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

inherits(Modeling, BaseModeling);

Modeling.$inject = [ 'eventBus', 'elementFactory', 'commandStack' ];

module.exports = Modeling;


Modeling.prototype.getHandlers = function() {
  var handlers = BaseModeling.prototype.getHandlers.call(this);

  handlers['element.updateProperties'] = UpdatePropertiesHandler;
  handlers['canvas.updateRoot'] = UpdateCanvasRootHandler;

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
    if (sourceBo.$instanceOf('bpmn:FlowNode') &&
        targetBo.$instanceOf('bpmn:FlowNode') &&
       !sourceBo.$instanceOf('bpmn:EndEvent') &&
       !targetBo.$instanceOf('bpmn:StartEvent')) {

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


/**
 * Transform the current diagram into a collaboration.
 *
 * @return {djs.model.Root} the new root element
 */
Modeling.prototype.makeCollaboration = function() {

  var collaborationElement = this._create('root', {
    type: 'bpmn:Collaboration'
  });

  var context = {
    newRoot: collaborationElement
  };

  this._commandStack.execute('canvas.updateRoot', context);

  return collaborationElement;
};

/**
 * Transform the current diagram into a process.
 *
 * @return {djs.model.Root} the new root element
 */
Modeling.prototype.makeProcess = function() {

  var processElement = this._create('root', {
    type: 'bpmn:Process'
  });

  var context = {
    newRoot: processElement
  };

  this._commandStack.execute('canvas.updateRoot', context);
};