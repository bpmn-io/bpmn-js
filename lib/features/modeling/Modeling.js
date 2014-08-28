'use strict';

var _ = require('lodash');

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling');

var CreateShapeHandler = require('diagram-js/lib/features/modeling/cmd/CreateShapeHandler'),
    DeleteShapeHandler = require('diagram-js/lib/features/modeling/cmd/DeleteShapeHandler'),
    MoveShapeHandler = require('diagram-js/lib/features/modeling/cmd/MoveShapeHandler'),

    AppendShapeHandler = require('./cmd/AppendShapeHandler'),

    CreateLabelHandler = require('diagram-js/lib/features/modeling/cmd/CreateLabelHandler'),

    CreateConnectionHandler = require('diagram-js/lib/features/modeling/cmd/CreateConnectionHandler'),
    DeleteConnectionHandler = require('diagram-js/lib/features/modeling/cmd/DeleteConnectionHandler'),
    MoveConnectionHandler = require('diagram-js/lib/features/modeling/cmd/MoveConnectionHandler'),
    LayoutConnectionHandler = require('diagram-js/lib/features/modeling/cmd/LayoutConnectionHandler');


/**
 * BPMN 2.0 modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, commandStack) {
  BaseModeling.call(this, eventBus, commandStack);
}

Modeling.prototype = Object.create(BaseModeling.prototype);

Modeling.$inject = [ 'eventBus', 'commandStack' ];

module.exports = Modeling;


Modeling.prototype.registerHandlers = function(commandStack) {
  commandStack.registerHandler('shape.create', CreateShapeHandler);
  commandStack.registerHandler('shape.delete', DeleteShapeHandler);
  commandStack.registerHandler('shape.move', MoveShapeHandler);

  commandStack.registerHandler('shape.append', AppendShapeHandler);

  commandStack.registerHandler('label.create', CreateLabelHandler);

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


/**
 * Append a flow node to the element with the given source
 * at the specified position.
 */
Modeling.prototype.appendFlowNode = function(source, type, position) {

  position = position || {
    x: source.x + source.width + 100,
    y: source.y + source.height / 2
  };

  return this.appendShape(source, { type: type }, position, { type: 'bpmn:SequenceFlow'});
};

Modeling.prototype.appendTextAnnotation = function(source, type, position) {

  position = position || {
    x: source.x + source.width / 2 + 75,
    y: source.y - (source.height / 2) - 100
  };

  return this.appendShape(source, { type: type }, position, { type: 'bpmn:Association'});
};
