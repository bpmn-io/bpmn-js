'use strict';

var ResizeUtil = require('./ResizeUtil');


/**
 * API to resize a shape
 */
function Resize(eventBus, modeling) {

  this._modeling = modeling;
  this._eventBus = eventBus;

  this._resizablehandler = null;

}

Resize.$inject = [ 'eventBus', 'modeling' ];

module.exports = Resize;

/**
 * ResizableHandler is used to restrict the resizable elements.
 */
Resize.prototype.registerResizableHandler = function(resizablehandler) {

  this._resizablehandler = resizablehandler;
};

Resize.prototype.isResizable = function(element) {

  return !!this._resizablehandler ? this._resizablehandler(element) : true;
};

Resize.prototype.resizeShape = function(shape, option) {

  var eventBus  = this._eventBus;

  var direction = option.direction;

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

  var newBBox = ResizeUtil.createResizeBBox(direction || 'se', oldBBox, {
    dx: dx,
    dy: dy
  });

  this._modeling.resizeShape(shape, newBBox);

  eventBus.fire('shape.resized', {
    shape: shape,
    oldBBox: oldBBox,
    newBBox: newBBox
  });
};
