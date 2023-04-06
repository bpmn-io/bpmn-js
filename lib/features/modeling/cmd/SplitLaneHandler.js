import {
  getChildLanes,
  LANE_INDENTATION
} from '../util/LaneUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 */

/**
 * A handler that splits a lane into a number of sub-lanes,
 * creating new sub lanes, if necessary.
 *
 * @implements {CommandHandler}
 *
 * @param {Modeling} modeling
 * @param {Translate} translate
 */
export default function SplitLaneHandler(modeling, translate) {
  this._modeling = modeling;
  this._translate = translate;
}

SplitLaneHandler.$inject = [
  'modeling',
  'translate'
];


SplitLaneHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling,
      translate = this._translate;

  var shape = context.shape,
      newLanesCount = context.count;

  var childLanes = getChildLanes(shape),
      existingLanesCount = childLanes.length;

  if (existingLanesCount > newLanesCount) {
    throw new Error(translate('more than {count} child lanes', { count: newLanesCount }));
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
