import {
  getChildLanes,
  LANE_INDENTATION
} from '../util/LaneUtil';

import {
  isHorizontal
} from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * A handler that splits a lane into a number of sub-lanes,
 * creating new sub lanes, if necessary.
 *
 * @implements {CommandHandler}
 *
 * @param {Modeling} modeling
 */
export default function SplitLaneHandler(modeling) {
  this._modeling = modeling;
}

SplitLaneHandler.$inject = [
  'modeling'
];


SplitLaneHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling;

  var shape = context.shape,
      newLanesCount = context.count;

  var childLanes = getChildLanes(shape),
      existingLanesCount = childLanes.length;

  if (existingLanesCount > newLanesCount) {
    throw new Error(`more than <${ newLanesCount }> child lanes`);
  }

  var isHorizontalLane = isHorizontal(shape);

  var laneBaseSize = isHorizontalLane ? shape.height : shape.width;
  var newLanesSize = Math.round(laneBaseSize / newLanesCount);

  // Iterate from first to last in child lane order,
  // resizing existing lanes and creating new ones
  // so that they split the parent proportionally.
  //
  // Due to rounding related errors, the last lane
  // needs to take up all the remaining space.
  var laneSize,
      laneBounds,
      newLaneAttrs,
      idx;

  for (idx = 0; idx < newLanesCount; idx++) {

    // if last lane
    if (idx === newLanesCount - 1) {
      laneSize = laneBaseSize - (newLanesSize * idx);
    } else {
      laneSize = newLanesSize;
    }

    laneBounds = isHorizontalLane ? {
      x: shape.x + LANE_INDENTATION,
      y: shape.y + idx * newLanesSize,
      width: shape.width - LANE_INDENTATION,
      height: laneSize
    } : {
      x: shape.x + idx * newLanesSize,
      y: shape.y + LANE_INDENTATION,
      width: laneSize,
      height: shape.height - LANE_INDENTATION
    };

    if (idx < existingLanesCount) {

      // resize existing lane
      modeling.resizeShape(childLanes[idx], laneBounds);
    } else {

      // create a new lane at position
      newLaneAttrs = {
        type: 'bpmn:Lane',
        isHorizontal: isHorizontalLane
      };

      modeling.createShape(newLaneAttrs, laneBounds, shape);
    }
  }
};
