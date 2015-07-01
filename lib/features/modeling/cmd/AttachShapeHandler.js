'use strict';


/**
 * A handler that implements reversible attaching/detaching of shapes.
 */
function AttachShapeHandler() {}

module.exports = AttachShapeHandler;


AttachShapeHandler.prototype.execute = function(context) {
  var shape = context.shape;

  this.updateAttachment(context);

  return shape;
};

AttachShapeHandler.prototype.revert = function(context) {
  var shape = context.shape;

  this.revertAttachment(context);

  return shape;
};

AttachShapeHandler.prototype.updateAttachment = function(context) {
  var shape = context.shape;

  // Dettachment
  if (!context.host) {
    return this.detach(context);
  }

  // Attachment
  if (!shape.host) {
    return this.attach(context);
  }

  // Reattachment
  this.reattach(context);
};

AttachShapeHandler.prototype.detach = function(context) {
  var shape = context.shape,
      idx;

  idx = shape.host.attachers.indexOf(shape);

  if (idx !== -1) {
    shape.host.attachers.splice(idx, 1);
  }

  context.host = shape.host;

  shape.host = null;
};

AttachShapeHandler.prototype.attach = function(context) {
  var shape = context.shape,
      host = context.host;

  shape.host = host;

  host.attachers.push(shape);

  context.host = null;
};

AttachShapeHandler.prototype.reattach = function(context) {
  var shape = context.shape,
      host = context.host,
      idx;

  idx = shape.host.attachers.indexOf(shape);

  if (idx !== -1) {
    shape.host.attachers.splice(idx, 1);
  }

  context.host = shape.host;

  shape.host = host;

  host.attachers.push(shape);
};

AttachShapeHandler.prototype.revertAttachment = function(context) {
  var shape = context.shape;

  // Revert detachment
  if (!shape.host) {
    return this.attach(context);
  }

  // Revert attachment
  if (!context.host) {
    return this.detach(context);
  }

  // Revert reattachment
  this.reattach(context);
};
