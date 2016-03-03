'use strict';

var getChildLanes = require('../util/LaneUtil').getChildLanes;

var LANE_INDENTATION = require('../util/LaneUtil').LANE_INDENTATION;

/**
 * A handler that splits a lane into a number of sub-lanes,
 * creating new sub lanes, if neccessary.
 *
 * @param {Modeling} modeling
 */
function SplitLaneHandler(modeling, translate) {
  this._modeling = modeling;
  this._translate = translate;
}

SplitLaneHandler.$inject = [ 'modeling', 'translate'];

module.exports = SplitLaneHandler;


SplitLaneHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling,
      translate = this._translate;

  var shape = context.shape,
      newLanesCount = context.count;

  var childLanes = getChildLanes(shape),
      existingLanesCount = childLanes.length;

  if (existingLanesCount > newLanesCount) {
    throw new Error(translate.t('more than {number} child lanes', { number: newLanesCount }));
  }

  var newLanesHeight = Math.round(shape.height / newLanesCount);

  // Iterate from top to bottom in child lane order,
  // resizing existing lanes and creating new ones
  // so that they split the parent proportionally.
  //
  // Due to rounding related errors, the bottom lane
  // needs to take up all the remaining space.
  var laneY,
      laneHeight,
      laneBounds,
      newLaneAttrs,
      idx;

  for (idx = 0; idx < newLanesCount; idx++) {

    laneY = shape.y + idx * newLanesHeight;

    // if bottom lane
    if (idx === newLanesCount - 1) {
      laneHeight = shape.height - (newLanesHeight * idx);
    } else {
      laneHeight = newLanesHeight;
    }

    laneBounds = {
      x: shape.x + LANE_INDENTATION,
      y: laneY,
      width: shape.width - LANE_INDENTATION,
      height: laneHeight
    };

    if (idx < existingLanesCount) {
      // resize existing lane
      modeling.resizeShape(childLanes[idx], laneBounds);
    } else {
      // create a new lane at position
      newLaneAttrs = {
        type: 'bpmn:Lane'
      };

      modeling.createShape(newLaneAttrs, laneBounds, shape);
    }
  }
};
