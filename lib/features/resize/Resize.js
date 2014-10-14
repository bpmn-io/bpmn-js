'use strict';

var ResizeUtil = require('./ResizeUtil');


/**
 * API to resize a shape
 */
function Resize(eventBus, modeling) {

  this._modeling = modeling;
  this._eventBus = eventBus;

  this._resizableHandler = null;
  this._minsizeHandler = null;

}

Resize.$inject = [ 'eventBus', 'modeling' ];

module.exports = Resize;

/**
 * ResizableHandler is used to restrict the resizable elements.
 */
Resize.prototype.registerResizableHandler = function(resizableHandler) {

  this._resizableHandler = resizableHandler;
};

Resize.prototype.registerMiniumSizeResolver = function(minsizeHandler) {

  this._minsizeHandler = minsizeHandler;
};

Resize.prototype.isResizable = function(element) {

  return !!this._resizableHandler ? this._resizableHandler(element) : true;
};

Resize.prototype.getMinimumSize = function(element) {

  if (!!this._minsizeHandler) {
    return this._minsizeHandler(element);
  } else {
    return {
      height: 1,
      width:  1
    };
  }
};

Resize.prototype.resizeShape = function(shape, option) {

  var eventBus  = this._eventBus;

  var direction = option.direction || 'se';

  var minSize   = this.getMinimumSize(shape);

  var oldBBox  = {
    height: shape.height,
    width:  shape.width,
    x:      shape.x,
    y:      shape.y
  };

  var width,
      height;

  // shape will be resized by delta.x and delta.y
  // and moved in direction
  var dx = option.delta.x;
  var dy = option.delta.y;

  var newBBox = ResizeUtil.createResizeBBox(direction , oldBBox, {
    dx: dx,
    dy: dy
  }, minSize);

  this._modeling.resizeShape(shape, newBBox);

  eventBus.fire('shape.resized', {
    shape: shape,
    oldBBox: oldBBox,
    newBBox: newBBox
  });
};
