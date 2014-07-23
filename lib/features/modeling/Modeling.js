'use strict';

var _ = require('lodash');

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling');

var AppendShapeHandler = require('./cmd/AppendShapeHandler'),
    CreateShapeHandler = require('diagram-js/lib/features/modeling/cmd/CreateShapeHandler'),
    CreateConnectionHandler = require('diagram-js/lib/features/modeling/cmd/CreateConnectionHandler'),
    CreateLabelHandler = require('diagram-js/lib/features/modeling/cmd/CreateLabelHandler');


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
  commandStack.registerHandler('shape.appendShape', AppendShapeHandler);
  commandStack.registerHandler('shape.create', CreateShapeHandler);
  commandStack.registerHandler('connection.create', CreateConnectionHandler);
  commandStack.registerHandler('label.create', CreateLabelHandler);
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

  return this.appendShape(source, { type: type }, position);
};
