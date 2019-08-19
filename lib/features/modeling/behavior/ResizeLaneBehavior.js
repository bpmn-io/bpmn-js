import { is } from '../../../util/ModelUtil';

import {
  roundBounds
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';

var SLIGHTLY_HIGHER_PRIORITY = 1001;


/**
 * Invoke {@link Modeling#resizeLane} instead of
 * {@link Modeling#resizeShape} when resizing a Lane
 * or Participant shape.
 */
export default function ResizeLaneBehavior(eventBus, modeling) {

  eventBus.on('resize.start', SLIGHTLY_HIGHER_PRIORITY + 500, function(event) {
    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:Lane') || is(shape, 'bpmn:Participant')) {

      // should we resize the opposite lane(s) in
      // order to compensate for the resize operation?
      context.balanced = !hasPrimaryModifier(event);
    }
  });

  /**
   * Intercept resize end and call resize lane function instead.
   */
  eventBus.on('resize.end', SLIGHTLY_HIGHER_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        canExecute = context.canExecute,
        newBounds = context.newBounds;

    if (is(shape, 'bpmn:Lane') || is(shape, 'bpmn:Participant')) {

      if (canExecute) {

        // ensure we have actual pixel values for new bounds
        // (important when zoom level was > 1 during move)
        newBounds = roundBounds(newBounds);

        // perform the actual resize
        modeling.resizeLane(shape, newBounds, context.balanced);
      }

      // stop propagation
      return false;
    }
  });
}

ResizeLaneBehavior.$inject = [
  'eventBus',
  'modeling'
];
