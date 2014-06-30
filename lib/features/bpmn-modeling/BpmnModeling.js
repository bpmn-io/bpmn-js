'use strict';

var AppendFlowNodeHandler = require('./cmd/AppendFlowNodeHandler');

/**
 * BPMN 2.0 modeling features activator
 *
 * @param {CommandStack} commandStack
 */
function BpmnModeling(commandStack) {
  commandStack.registerHandler('shape.appendNode', AppendFlowNodeHandler);
  this._commandStack = commandStack;
}

BpmnModeling.$inject = [ 'commandStack' ];


/**
 * Append a flow node to the element with the given source
 * at the specified position.
 */
BpmnModeling.prototype.appendFlowNode = function(source, parent, type, position) {

  var context = {
    source: source,
    type: type,
    parent: parent,
    position: position
  };

  this._commandStack.execute('shape.appendNode', context);

  return context.target;
};


module.exports = BpmnModeling;