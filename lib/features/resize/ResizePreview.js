'use strict';

var MARKER_RESIZING = 'djs-resizing',
    MARKER_RESIZE_NOT_OK = 'resize-not-ok';

var LOW_PRIORITY = 500;

/**
 * Provides previews for resizing shapes when resizing.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Styles} styles
 */
function ResizePreview(eventBus, elementRegistry, canvas, styles, previewSupport) {

  // add and update previews
  eventBus.on('resize.move', LOW_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        bounds = context.newBounds,
        frame = context.frame;

    if (!frame) {
      frame = context.frame = previewSupport.addFrame(shape, canvas.getDefaultLayer());

      canvas.addMarker(shape, MARKER_RESIZING);
    }

    if (bounds.width > 5) {
      frame.attr({ x: bounds.x, width: bounds.width });
    }

    if (bounds.height > 5) {
      frame.attr({ y: bounds.y, height: bounds.height });
    }

    frame[context.canExecute ? 'removeClass' : 'addClass'](MARKER_RESIZE_NOT_OK);
  });

  // remove previews
  eventBus.on('resize.cleanup', function(event) {
    var context = event.context,
        shape = context.shape,
        frame = context.frame;

    if (frame) {
      context.frame.remove();
    }

    canvas.removeMarker(shape, MARKER_RESIZING);
  });
}

ResizePreview.$inject = [ 'eventBus', 'elementRegistry', 'canvas', 'styles', 'previewSupport'];

module.exports = ResizePreview;
