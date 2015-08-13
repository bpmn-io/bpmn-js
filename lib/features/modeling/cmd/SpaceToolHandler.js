'use strict';

var forEach = require('lodash/collection/forEach');

var SpaceUtil = require('../../space-tool/SpaceUtil');

/**
 * A handler that implements reversible creating and removing of space.
 *
 * It executes in two phases:
 *
 *  (1) resize all affected resizeShapes
 *  (2) move all affected moveElements
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
      delta = context.delta,
      direction = context.direction;

  forEach(resizingShapes, function(shape) {
    var newBounds = SpaceUtil.resizeBounds(shape, direction, delta);

    modeling.resizeShape(shape, newBounds);
  });
};

SpaceToolHandler.prototype.postExecute = function(context) {
  // move
  var modeling = this._modeling,
      movingShapes = context.movingShapes,
      delta = context.delta;

  modeling.moveElements(movingShapes, delta);
};

SpaceToolHandler.prototype.execute = function(context) {};
SpaceToolHandler.prototype.revert = function(context) {};
