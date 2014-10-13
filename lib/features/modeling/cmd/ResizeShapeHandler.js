'use strict';

var _ = require('lodash');

var Elements = require('../../../util/Elements');


/**
 * A handler that implements reversible resizing of shapes.
 *
 */
function ResizeShapeHandler(modeling) {
  this._modeling = modeling;
}

module.exports = ResizeShapeHandler;

/**
 * {
 *   shape: {....}
 *   newBBox: {
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
      newBBox = context.newBBox;

  // save old bbox in context
  _.extend(context, {
    oldBBox: {
      width:  shape.width,
      height: shape.height,
      x:      shape.x,
      y:      shape.y
    }
  });

  // update shape
  _.extend(shape, {
    width:  newBBox.width,
    height: newBBox.height,
    x:      newBBox.x,
    y:      newBBox.y
  });

  return shape;
};

ResizeShapeHandler.prototype.postExecute = function(context) {

  var shape = context.shape;

  var modeling = this._modeling;

  _.forEach(shape.incoming, function(c) {
    modeling.layoutConnection(c);
  });

  _.forEach(shape.outgoing, function(c) {
    modeling.layoutConnection(c);
  });

};

ResizeShapeHandler.prototype.revert = function(context) {

  var shape   = context.shape,
      oldBBox = context.oldBBox;

  // restore previous bbox
  _.extend(shape, {
    width:  oldBBox.width,
    height: oldBBox.height,
    x:      oldBBox.x,
    y:      oldBBox.y
  });

  return shape;
};
