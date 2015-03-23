'use strict';


function AppendBehavior(eventBus, elementFactory) {

  // assign the correct connection
  // when appending a shape to another shape

  eventBus.on('commandStack.shape.append.preExecute', function(event) {

    var context = event.context,
        source = context.source,
        shape = context.shape,
        parent = context.parent || source.parent;

    if (!context.position) {

      if (shape.businessObject.$instanceOf('bpmn:TextAnnotation')) {
        context.position = {
          x: source.x + source.width / 2 + 75,
          y: source.y - (50) - shape.height / 2
        };
      } else {
        context.position = {
          x: source.x + source.width + 80 + shape.width / 2,
          y: source.y + source.height / 2
        };
      }
    }

    if (!context.connection) {
      var connectionAttrs;

      // connect flow nodes in the same container
      if (shape.businessObject.$instanceOf('bpmn:FlowNode') && parent.children.indexOf(source) !== -1) {
        connectionAttrs = { type: 'bpmn:SequenceFlow' };
      } else {
        // association always works
        connectionAttrs = { type: 'bpmn:Association' };
      }

      context.connection = elementFactory.create('connection', connectionAttrs);
    }
  });
}


AppendBehavior.$inject = [ 'eventBus', 'elementFactory' ];

module.exports = AppendBehavior;