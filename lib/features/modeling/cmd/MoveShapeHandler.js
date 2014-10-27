'use strict';

var _ = require('lodash');

var Elements = require('../../../util/Elements');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapeHandler(modeling, drop) {
  this._modeling = modeling;
  this._drop     = drop;
}

MoveShapeHandler.$inject = [ 'modeling', 'drop' ];

module.exports = MoveShapeHandler;


MoveShapeHandler.prototype.execute = function(context) {

  var shape  = context.shape,
      delta  = context.delta,
      self   = this;

  // update shape parent + position
  _.extend(shape, {
    x: shape.x + delta.x,
    y: shape.y + delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.postExecute = function(context) {

  var shape  = context.shape,
      delta  = context.delta,
      self   = this;

  var modeling = this._modeling;

  if (context.hints.layout !== false) {
    _.forEach(shape.incoming, function(c) {
      modeling.layoutConnection(c);
    });

    _.forEach(shape.outgoing, function(c) {
      modeling.layoutConnection(c);
    });
  }

  if (context.hints.recurse !== false) {
    this.moveChildren(shape, context);
  }

  return shape;
};

MoveShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      delta = context.delta;

  // revert to old position and parent
  _.extend(shape, {
    x: shape.x - delta.x,
    y: shape.y - delta.y
  });
};

MoveShapeHandler.prototype.moveChildren = function(shape, context) {

  var delta = context.delta;

  var childShapes = {},
      childConnections = {},
      allConnections = {};

  var modeling = this._modeling;

  Elements.eachElement(shape.children, function(child) {

    if (child.waypoints) {
      // remember connection
      childConnections[child.id] = allConnections[child.id] = child;
    } else {
      // remember shape
      childShapes[child.id] = child;

      // remember all connections
      _.forEach(child.incoming, function(c) {
        allConnections[c.id] = c;
      });

      _.forEach(child.outgoing, function(c) {
        allConnections[c.id] = c;
      });

      // recurse into children
      return child.children;
    }
  });

  // move all shapes
  _.forEach(childShapes, function(s) {

    modeling.moveShape(s, delta, null, {
      recurse: false,
      layout: false
    });
  });

  // move all child connections / layout external connections
  _.forEach(allConnections, function(c) {

    if (childConnections[c.id]) {
      modeling.moveConnection(c, delta);
    } else {
      modeling.layoutConnection(c);
    }
  });
};
