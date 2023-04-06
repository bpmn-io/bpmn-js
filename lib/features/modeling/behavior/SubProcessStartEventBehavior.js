import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import { isExpanded } from '../../../util/DiUtil.js';

/**
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * Add start event replacing element with expanded sub process.
 *
 * @param {Injector} injector
 * @param {Modeling} modeling
 */
export default function SubProcessStartEventBehavior(injector, modeling) {
  injector.invoke(CommandInterceptor, this);

  this.postExecuted('shape.replace', function(event) {
    var oldShape = event.context.oldShape,
        newShape = event.context.newShape;

    if (
      !is(newShape, 'bpmn:SubProcess') ||
      ! (is(oldShape, 'bpmn:Task') || is(oldShape, 'bpmn:CallActivity')) ||
      !isExpanded(newShape)
    ) {
      return;
    }

    var position = getStartEventPosition(newShape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, newShape);
  });
}

SubProcessStartEventBehavior.$inject = [
  'injector',
  'modeling'
];

inherits(SubProcessStartEventBehavior, CommandInterceptor);

// helpers //////////

function getStartEventPosition(shape) {
  return {
    x: shape.x + shape.width / 6,
    y: shape.y + shape.height / 2
  };
}
