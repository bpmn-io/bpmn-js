'use strict';


/**
 * API to resize a shape
 */
function Resize(eventBus, modeling) {

  this._modeling = modeling;
  this._eventBus = eventBus;
}

Resize.$inject = [ 'eventBus', 'modeling' ];

module.exports = Resize;


Resize.prototype.resizeShape = function(shape, option) {

  var eventBus  = this._eventBus;

  var direction = option.direction;

  var oldWidth  = shape.width,
      oldHeight = shape.height;

  var width,
      height,
      x,
      y;

  // if direction is set the shape will be resized by delta.x and delta.y
  // and moved in direction
  if (direction) {

    var dx = option.delta.x;
    var dy = option.delta.y;

    if (direction === 'se') {
      width  = shape.width  - dx;
      height = shape.height - dy;

      this._modeling.resizeShape(shape, {
        width: width,
        height: height
      });
    } else if (direction === 'sw') {
      width  = shape.width  + dx;
      height = shape.height - dy;

      this._modeling.resizeShape(shape, {
        width: width,
        height: height
      });
      this._modeling.moveShape(shape, {x: -dx, y: 0}, shape.parent);
    } else if (direction === 'nw') {
      width  = shape.width  + dx;
      height = shape.height + dy;

      this._modeling.resizeShape(shape, {
        width: width,
        height: height
      });
      this._modeling.moveShape(shape, {x: -dx, y: -dy}, shape.parent);
    } else if (direction === 'ne') {
      width  = shape.width  - dx;
      height = shape.height + dy;

      this._modeling.resizeShape(shape, {
        width: width,
        height: height
      });
      this._modeling.moveShape(shape, {x: 0, y: -dy}, shape.parent);
    }
  } else {
    width  = option.width  || shape.width;
    height = option.height || shape.height;

    this._modeling.resizeShape(shape, {
      width: width,
      height: height
    });
  }

  eventBus.fire('shape.resized', {
    shape: shape,
    oldSize: {
      width:  oldWidth,
      height: oldHeight
    },
    newSize: {
      width:  width,
      height: height
    }
  });

  // TODO Later we may need an adjustment of connections after size changed
};
