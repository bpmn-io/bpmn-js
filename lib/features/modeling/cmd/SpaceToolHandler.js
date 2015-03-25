'use strict';

var forEach = require('lodash/collection/forEach');

var ResizeUtil = require('../../space-tool/Util');

/**
 * A handler that implements reversible space tool behaviour.
 *
 */
function SpaceToolHandler(modeling) {
  this._modeling = modeling;
}

SpaceToolHandler.$inject = [ 'modeling' ];

module.exports = SpaceToolHandler;


SpaceToolHandler.prototype.preExecute = function(context) {
  // resize
  var modeling = this._modeling,
      resizingShapes = context.resizingShapes,
      axis = context.axis,
      delta = context.delta,
      keyModifier = context.keyModifier,
      newBounds;


  forEach(resizingShapes, function(parent) {
    var parentBounds = {
      x: parent.x, y: parent.y,
      width: parent.width, height: parent.height
    };

    if(keyModifier) {
      newBounds = ResizeUtil.resizeBoundsModifier(parentBounds, axis, delta, keyModifier);
    } else {
      newBounds = ResizeUtil.resizeBounds(parentBounds, axis, delta, keyModifier);
    }
    
    modeling.resizeShape(parent, newBounds);
  });
};

SpaceToolHandler.prototype.postExecute = function(context) {
  // move
  var modeling = this._modeling,
      movingShapes = context.movingShapes,
      delta = context.delta;

  modeling.moveShapes(movingShapes, delta);
};

SpaceToolHandler.prototype.execute = function(context) {};
SpaceToolHandler.prototype.revert = function(context) {};
