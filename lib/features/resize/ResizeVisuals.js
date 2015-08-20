'use strict';

var Snap = require('../../../vendor/snapsvg');

var MARKER_RESIZING = 'djs-resizing',
    MARKER_RESIZE_NOT_OK = 'resize-not-ok';

var LOW_PRIORITY = 500;


/**
 * This component is responsible for creating a visual during resize.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function ResizeVisuals(eventBus, canvas){

  this._canvas = canvas;

  var self = this;

  eventBus.on('resize.start', LOW_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape;

    // add resizable indicator
    canvas.addMarker(shape, MARKER_RESIZING);

    self.create(context);
  });


  eventBus.on('resize.move', LOW_PRIORITY, function(event) {
    var context = event.context;

    // update resize frame visuals
    self.update(context);
  });


  eventBus.on('resize.cleanup', function(event) {
    var context = event.context,
        shape = context.shape;

    // remove resizable indicator
    canvas.removeMarker(shape, MARKER_RESIZING);

    // remove frame + destroy context
    self.remove(context);
  });
}

/**
 * A helper that realizes the resize visuals
 */
ResizeVisuals.prototype.create = function(context) {
  var container = this._canvas.getDefaultLayer(),
      shape = context.shape,
      frame;

  frame = context.frame = Snap.create('rect', {
    class: 'djs-resize-overlay',
    width:  shape.width + 10,
    height: shape.height + 10,
    x: shape.x -5,
    y: shape.y -5
  });

  frame.appendTo(container);
};

ResizeVisuals.prototype.update = function(context) {
  var frame = context.frame,
      bounds = context.newBounds;

  if (bounds.width > 5) {
    frame.attr({
      x: bounds.x,
      width: bounds.width
    });
  }

  if (bounds.height > 5) {
    frame.attr({
      y: bounds.y,
      height: bounds.height
    });
  }

  frame[context.canExecute ? 'removeClass' : 'addClass'](MARKER_RESIZE_NOT_OK);
};

ResizeVisuals.prototype.remove = function(context) {
  if (context.frame) {
    context.frame.remove();
  }
};

ResizeVisuals.$inject = [ 'eventBus', 'canvas' ];

module.exports = ResizeVisuals;
