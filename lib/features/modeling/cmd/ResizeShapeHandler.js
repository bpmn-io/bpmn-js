'use strict';

var _ = require('lodash');

var Elements = require('../../../util/Elements');


/**
 * A handler that implements reversible resizing of shapes.
 */
function ResizeShapeHandler(modeling) {
}

module.exports = ResizeShapeHandler;


ResizeShapeHandler.prototype.execute = function(context) {

  var shape   = context.shape,
      newSize = context.newSize;

  // save old size in context
  _.extend(context, {
    oldSize: {
      width:  shape.width,
      height: shape.height
    }
  });

  // update shape
  _.extend(shape, {
    width:  newSize.width,
    height: newSize.height
  });

  return shape;
};


ResizeShapeHandler.prototype.revert = function(context) {

  var shape   = context.shape,
      oldSize = context.oldSize;

  // revert to old width and height
  _.extend(shape, {
    width:  oldSize.width,
    height: oldSize.height
  });

  return shape;
};
