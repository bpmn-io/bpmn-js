'use strict';

var forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map');

/**
 * A handler that implements reversible attaching/detaching of shapes.
 */
function AttachShapeHandler(modeling) {
  this._modeling = modeling;
}

module.exports = AttachShapeHandler;

AttachShapeHandler.$inject = [ 'modeling' ];


AttachShapeHandler.prototype.execute = function(context) {
  var shape = context.shape,
      newHost = context.newHost,
      oldHost = shape.host;

  // (0) detach from old host
  context.oldHost = oldHost;
  context.attacherIdx = removeAttacher(oldHost, shape);

  // (1) attach to new host
  addAttacher(newHost, shape);

  // position attacher and it's label on top of host
  positionOnTop(context);

  // (2) update host
  shape.host = newHost;

  return shape;
};

AttachShapeHandler.prototype.revert = function(context) {
  var shape = context.shape,
      newHost = context.newHost,
      oldHost = context.oldHost,
      attacherIdx = context.attacherIdx;

  // (2) update host
  shape.host = oldHost;

  // (1) attach to new host
  removeAttacher(newHost, shape);

  // (0) detach from old host
  addAttacher(oldHost, shape, attacherIdx);

  // position attacher and it's label on top of oldHost
  reposition(context);

  return shape;
};


function insertAfter(coll, a, b) {
  // b comes after a
  var aIdx = coll.indexOf(a),
      bIdx = coll.indexOf(b);

  if ((aIdx === -1 || bIdx === -1) || (bIdx > aIdx)) {
    return;
  }

  coll.splice(bIdx, 1);

  aIdx = coll.indexOf(a);

  coll.splice(aIdx, 1, a, b);
}

function positionOnTop(context) {
  var shape = context.shape,
      newHost = context.newHost,
      oldHost = context.oldHost,
      parent = shape.parent,
      children = parent.children,
      label;

  if (!newHost) {
    return;
  }

  var elements = (label = shape.label) ? [ oldHost, shape, label ] : [ oldHost, shape ];

  context.elements = map(elements, function(element) {
    return {
      shape: element,
      idx: children.indexOf(element)
    };
  });

  insertAfter(children, newHost, shape);

  if (label) {
    insertAfter(children, shape, label);
  }
}

function reposition(context) {
  var shape = context.shape,
      oldHost = context.oldHost,
      parent = shape.parent,
      children = parent.children,
      elements = context.elements;

  if (!oldHost) {
    return;
  }

  forEach(elements, function(element) {
    children.splice(children.indexOf(element.shape), 1);

    children.splice(element.idx, 0, element.shape);
  });
}


function removeAttacher(host, attacher) {
  var attachers = host && host.attachers;

  var idx = -1;

  if (attachers) {
    idx = attachers.indexOf(attacher);

    if (idx !== -1) {
      attachers.splice(idx, 1);
    }
  }

  return idx;
}

function addAttacher(host, attacher, idx) {

  if (!host) {
    return;
  }

  var attachers = host.attachers;

  if (!attachers) {
    host.attachers = attachers = [];
  }

  attachers.splice(idx || attachers.length, 0, attacher);
}
