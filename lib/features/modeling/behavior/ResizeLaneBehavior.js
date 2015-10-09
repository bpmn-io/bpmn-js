'use strict';

var is = require('../../../util/ModelUtil').is;

var roundBounds = require('diagram-js/lib/layout/LayoutUtil').roundBounds;

var SLIGHTLY_HIGHER_PRIORITY = 1001;


/**
 * Invoke {@link Modeling#resizeLane} instead of
 * {@link Modeling#resizeShape} when resizing a Lane
 * or Participant shape.
 */
function ResizeLaneBehavior(eventBus, modeling) {

  /**
   * Intercept resize end and call resize lane function instead.
   */
  eventBus.on('resize.end', SLIGHTLY_HIGHER_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        canExecute = context.canExecute,
        newBounds = context.newBounds,
        balanced;

    if (is(shape, 'bpmn:Lane') || is(shape, 'bpmn:Participant')) {

      if (canExecute) {

        // should we resize the opposite lane(s) in
        // order to compensate for the resize operation?
        balanced = !(event.originalEvent && event.originalEvent.altKey);

        // ensure we have actual pixel values for new bounds
        // (important when zoom level was > 1 during move)
        newBounds = roundBounds(newBounds);

        // perform the actual resize
        modeling.resizeLane(shape, newBounds, balanced);
      }

      // stop propagation
      return false;
    }
  });
}

ResizeLaneBehavior.$inject = [ 'eventBus', 'modeling' ];

module.exports = ResizeLaneBehavior;
