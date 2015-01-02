'use strict';

var _ = require('lodash');

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling');

var CreateShapeHandler = require('diagram-js/lib/features/modeling/cmd/CreateShapeHandler'),
    DeleteShapeHandler = require('diagram-js/lib/features/modeling/cmd/DeleteShapeHandler'),
    MoveShapeHandler = require('diagram-js/lib/features/modeling/cmd/MoveShapeHandler'),
    MoveShapesHandler = require('diagram-js/lib/features/modeling/cmd/MoveShapesHandler'),
    ResizeShapeHandler = require('diagram-js/lib/features/modeling/cmd/ResizeShapeHandler'),

    UpdatePropertiesHandler = require('./cmd/UpdatePropertiesHandler'),

    AppendShapeHandler = require('diagram-js/lib/features/modeling/cmd/AppendShapeHandler'),

    CreateLabelHandler = require('diagram-js/lib/features/modeling/cmd/CreateLabelHandler'),

    CreateConnectionHandler = require('diagram-js/lib/features/modeling/cmd/CreateConnectionHandler'),
    DeleteConnectionHandler = require('diagram-js/lib/features/modeling/cmd/DeleteConnectionHandler'),
    MoveConnectionHandler = require('diagram-js/lib/features/modeling/cmd/MoveConnectionHandler'),
    LayoutConnectionHandler = require('diagram-js/lib/features/modeling/cmd/LayoutConnectionHandler');


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


Modeling.prototype.registerHandlers = function(commandStack) {
  commandStack.registerHandler('shape.create', CreateShapeHandler);
  commandStack.registerHandler('shape.delete', DeleteShapeHandler);
  commandStack.registerHandler('shape.move', MoveShapeHandler);
  commandStack.registerHandler('shapes.move', MoveShapesHandler);
  commandStack.registerHandler('shape.resize', ResizeShapeHandler);

  commandStack.registerHandler('shape.append', AppendShapeHandler);

  commandStack.registerHandler('label.create', CreateLabelHandler);

  commandStack.registerHandler('element.updateProperties', UpdatePropertiesHandler);

  commandStack.registerHandler('connection.create', CreateConnectionHandler);
  commandStack.registerHandler('connection.delete', DeleteConnectionHandler);
  commandStack.registerHandler('connection.move', MoveConnectionHandler);
  commandStack.registerHandler('connection.layout', LayoutConnectionHandler);
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