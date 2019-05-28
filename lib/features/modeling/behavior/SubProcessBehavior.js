import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import {
  expandedBounds,
  collapsedBounds
} from './ToggleElementCollapseBehaviour';


export default function SubProcessBehavior(elementFactory, eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  /**
   * Adjust position of sub process after it replaces a shape with incoming
   * sequence flows and no outgoing sequence flows to prevent overlap.
   */
  this.postExecuted('shape.replace', function(event) {
    var oldShape = event.context.oldShape,
        newShape = event.context.newShape;

    if (!is(newShape, 'bpmn:SubProcess') ||
      !hasIncomingSequenceFlows(newShape) ||
      hasOutgoingSequenceFlows(newShape)) {
      return;
    }

    modeling.moveShape(newShape, {
      x: oldShape.x - newShape.x,
      y: 0
    });
  });

  /**
   * Adjust position of sub process with incoming sequence flows and no outgoing
   * sequence flows after toggling to prevent overlap.
   */
  this.postExecuted('shape.toggleCollapse', function(event) {
    var context = event.context,
        shape = context.shape,
        defaultSize = elementFactory._getDefaultSize(shape),
        newBounds;

    if (!is(shape, 'bpmn:SubProcess') ||
      !hasIncomingSequenceFlows(shape) ||
      hasOutgoingSequenceFlows(shape)) {
      return;
    }

    if (shape.collapsed) {
      newBounds = collapsedBounds(shape, defaultSize);
    }

    if (!shape.collapsed) {
      newBounds = expandedBounds(shape, defaultSize);
    }

    modeling.moveShape(shape, {
      x: shape.x - newBounds.x,
      y: 0
    });
  });
}

SubProcessBehavior.$inject = [
  'elementFactory',
  'eventBus',
  'modeling'
];

inherits(SubProcessBehavior, CommandInterceptor);

// helpers //////////

function hasIncomingSequenceFlows(shape) {
  shape = shape || {};

  if (shape.incoming && shape.incoming.length) {
    return shape.incoming.some(isSequenceFlow);
  }

  return false;
}

function hasOutgoingSequenceFlows(shape) {
  shape = shape || {};

  if (shape.outgoing && shape.outgoing.length) {
    return shape.outgoing.some(isSequenceFlow);
  }

  return false;
}

function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}
