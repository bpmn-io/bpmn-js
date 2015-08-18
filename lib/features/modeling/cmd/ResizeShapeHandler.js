'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');


/**
 * A handler that implements reversible resizing of shapes.
 *
 */
function ResizeShapeHandler(modeling) {
  this._modeling = modeling;
}

ResizeShapeHandler.$inject = [ 'modeling' ];

module.exports = ResizeShapeHandler;

/**
 * {
 *   shape: {....}
 *   newBounds: {
 *     width:  20,
 *     height: 40,
 *     x:       5,
 *     y:      10
 *   }
 *
 * }
 */
ResizeShapeHandler.prototype.execute = function(context) {

  var shape   = context.shape,
      newBounds = context.newBounds;

  if (newBounds.x === undefined || newBounds.y === undefined ||
      newBounds.width === undefined || newBounds.height === undefined) {
    throw new Error('newBounds must have {x, y, width, height} properties');
  }

  if (newBounds.width < 10 || newBounds.height < 10) {
    throw new Error('width and height cannot be less than 10px');
  }

  // save old bbox in context
  context.oldBounds = {
    width:  shape.width,
    height: shape.height,
    x:      shape.x,
    y:      shape.y
  };

  // update shape
  assign(shape, {
    width:  newBounds.width,
    height: newBounds.height,
    x:      newBounds.x,
    y:      newBounds.y
  });

  return shape;
};

ResizeShapeHandler.prototype.postExecute = function(context) {

  var shape = context.shape,
      oldBounds = context.oldBounds;

  var modeling = this._modeling;

  modeling.updateAnchors(shape, oldBounds);

  forEach(shape.incoming, function(c) {
    modeling.layoutConnection(c, { endChanged: true });
  });

  forEach(shape.outgoing, function(c) {
    modeling.layoutConnection(c, { startChanged: true });
  });

};

ResizeShapeHandler.prototype.revert = function(context) {

  var shape   = context.shape,
      oldBounds = context.oldBounds;

  // restore previous bbox
  assign(shape, {
    width:  oldBounds.width,
    height: oldBounds.height,
    x:      oldBounds.x,
    y:      oldBounds.y
  });

  return shape;
};
