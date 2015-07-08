'use strict';

var assign = require('lodash/object/assign');

var Collections = require('../../../util/Collections');

/**
 * A handler that implements reversible updating of the parent element.
 */
function UpdateParentHandler() {}

module.exports = UpdateParentHandler;

UpdateParentHandler.prototype.preExecute = function(context) {
  var shape = context.shape,
      newParent = this.getNewParent(context),
      oldParent = shape.parent;

  // save old parent in context
  context.oldParent = oldParent;
  context.oldParentIndex = Collections.indexOf(oldParent.children, shape);

  context.newParent = newParent;
};

UpdateParentHandler.prototype.execute = function(context) {
  var shape = context.shape,
      newParent = context.newParent;

  assign(shape, {
    parent: newParent
  });

  return shape;
};

UpdateParentHandler.prototype.revert = function(context) {

  var shape = context.shape,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex;

  // restore previous location in old parent
  Collections.add(oldParent.children, shape, oldParentIndex);

  assign(shape, {
    parent: oldParent
  });

  return shape;
};

UpdateParentHandler.prototype.getNewParent = function(context) {
  return context.parent || context.shape.parent;
};
