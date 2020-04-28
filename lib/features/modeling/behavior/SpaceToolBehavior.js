import { forEach } from 'min-dash';

import { is } from '../../../util/ModelUtil';

import { isExpanded } from '../../../util/DiUtil';

import {
  LANE_MIN_DIMENSIONS,
  PARTICIPANT_MIN_DIMENSIONS,
  SUB_PROCESS_MIN_DIMENSIONS,
  TEXT_ANNOTATION_MIN_DIMENSIONS
} from './ResizeBehavior';

import { getChildLanes } from '../util/LaneUtil';

var max = Math.max;


export default function SpaceToolBehavior(eventBus) {
  eventBus.on('spaceTool.getMinDimensions', function(context) {
    var shapes = context.shapes,
        axis = context.axis,
        start = context.start,
        minDimensions = {};

    forEach(shapes, function(shape) {
      var id = shape.id;

      if (is(shape, 'bpmn:Participant')) {

        if (isHorizontal(axis)) {
          minDimensions[ id ] = PARTICIPANT_MIN_DIMENSIONS;
        } else {
          minDimensions[ id ] = {
            width: PARTICIPANT_MIN_DIMENSIONS.width,
            height: getParticipantMinHeight(shape, start)
          };
        }

      }

      if (is(shape, 'bpmn:SubProcess') && isExpanded(shape)) {
        minDimensions[ id ] = SUB_PROCESS_MIN_DIMENSIONS;
      }

      if (is(shape, 'bpmn:TextAnnotation')) {
        minDimensions[ id ] = TEXT_ANNOTATION_MIN_DIMENSIONS;
      }
    });

    return minDimensions;
  });
}

SpaceToolBehavior.$inject = [ 'eventBus' ];


// helpers //////////
function isHorizontal(axis) {
  return axis === 'x';
}

/**
 * Get minimum height for participant taking lanes into account.
 *
 * @param {<djs.model.Shape>} participant
 * @param {number} start
 *
 * @returns {Object}
 */
function getParticipantMinHeight(participant, start) {
  var lanesMinHeight;

  if (!hasChildLanes(participant)) {
    return PARTICIPANT_MIN_DIMENSIONS.height;
  }

  lanesMinHeight = getLanesMinHeight(participant, start);

  return max(PARTICIPANT_MIN_DIMENSIONS.height, lanesMinHeight);
}

function hasChildLanes(element) {
  return !!getChildLanes(element).length;
}

function getLanesMinHeight(participant, resizeStart) {
  var lanes = getChildLanes(participant),
      resizedLane;

  // find the nested lane which is currently resized
  resizedLane = findResizedLane(lanes, resizeStart);

  // resized lane cannot shrink below the minimum height
  // but remaining lanes' dimensions are kept intact
  return participant.height - resizedLane.height + LANE_MIN_DIMENSIONS.height;
}

/**
 * Find nested lane which is currently resized.
 *
 * @param {Array<djs.model.Shape>} lanes
 * @param {number} resizeStart
 */
function findResizedLane(lanes, resizeStart) {
  var i, lane, childLanes;

  for (i = 0; i < lanes.length; i++) {
    lane = lanes[i];

    // resizing current lane or a lane nested
    if (resizeStart >= lane.y && resizeStart <= lane.y + lane.height) {
      childLanes = getChildLanes(lane);

      // a nested lane is resized
      if (childLanes.length) {
        return findResizedLane(childLanes, resizeStart);
      }

      // current lane is the resized one
      return lane;
    }
  }
}
