import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';
import { isExpanded } from '../../../util/DiUtil.js';

/**
 * Add start event child by default when creating an expanded subprocess
 * with create.start or replacing a task with an expanded subprocess.
 */
export default function SubProcessStartEventBehavior(eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  eventBus.on('create.start', function(event) {
    var shape = event.context.shape,
        hints = event.context.hints;

    hints.shouldAddStartEvent = is(shape, 'bpmn:SubProcess') && isExpanded(shape);
  });

  this.postExecuted('shape.create', function(event) {
    var shape = event.context.shape,
        hints = event.context.hints,
        position;

    if (!hints.shouldAddStartEvent) {
      return;
    }

    position = calculatePositionRelativeToShape(shape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, shape);
  });

  this.postExecuted('shape.replace', function(event) {
    var oldShape = event.context.oldShape,
        newShape = event.context.newShape,
        position;

    if (
      !is(newShape, 'bpmn:SubProcess') ||
      !is(oldShape, 'bpmn:Task') ||
      !isExpanded(newShape)
    ) {
      return;
    }

    position = calculatePositionRelativeToShape(newShape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, newShape);
  });
}

SubProcessStartEventBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(SubProcessStartEventBehavior, CommandInterceptor);

// helpers //////////

function calculatePositionRelativeToShape(shape) {
  return {
    x: shape.x + shape.width / 6,
    y: shape.y + shape.height / 2
  };
}
