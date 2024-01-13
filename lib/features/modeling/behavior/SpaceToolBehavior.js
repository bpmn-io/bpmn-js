import { forEach } from 'min-dash';

import { is } from '../../../util/ModelUtil';

import {
  isExpanded,
  isHorizontal
} from '../../../util/DiUtil';

import {
  GROUP_MIN_DIMENSIONS,
  LANE_MIN_DIMENSIONS,
  VERTICAL_LANE_MIN_DIMENSIONS,
  PARTICIPANT_MIN_DIMENSIONS,
  VERTICAL_PARTICIPANT_MIN_DIMENSIONS,
  SUB_PROCESS_MIN_DIMENSIONS,
  TEXT_ANNOTATION_MIN_DIMENSIONS
} from './ResizeBehavior';

import { getChildLanes } from '../util/LaneUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('../../../model/Types').Shape} Shape
 */

var max = Math.max;

/**
 * @param {EventBus} eventBus
 */
export default function SpaceToolBehavior(eventBus) {
  eventBus.on('spaceTool.getMinDimensions', function(context) {
    var shapes = context.shapes,
        axis = context.axis,
        start = context.start,
        minDimensions = {};

    forEach(shapes, function(shape) {
      var id = shape.id;

      if (is(shape, 'bpmn:Participant')) {
        minDimensions[ id ] = getParticipantMinDimensions(shape, axis, start);
      }

      if (is(shape, 'bpmn:Lane')) {
        minDimensions[ id ] = isHorizontal(shape) ? LANE_MIN_DIMENSIONS : VERTICAL_LANE_MIN_DIMENSIONS;
      }

      if (is(shape, 'bpmn:SubProcess') && isExpanded(shape)) {
        minDimensions[ id ] = SUB_PROCESS_MIN_DIMENSIONS;
      }

      if (is(shape, 'bpmn:TextAnnotation')) {
        minDimensions[ id ] = TEXT_ANNOTATION_MIN_DIMENSIONS;
      }

      if (is(shape, 'bpmn:Group')) {
        minDimensions[ id ] = GROUP_MIN_DIMENSIONS;
      }
    });

    return minDimensions;
  });
}

SpaceToolBehavior.$inject = [ 'eventBus' ];


// helpers //////////
function isHorizontalAxis(axis) {
  return axis === 'x';
}

/**
 * Get minimum dimensions for participant taking lanes into account.
 *
 * @param {Shape} participant
 * @param {Axis} axis
 * @param {number} start
 *
 * @return {number}
 */
function getParticipantMinDimensions(participant, axis, start) {
  var isHorizontalLane = isHorizontal(participant);

  if (!hasChildLanes(participant)) {
    return isHorizontalLane ? PARTICIPANT_MIN_DIMENSIONS : VERTICAL_PARTICIPANT_MIN_DIMENSIONS;
  }

  var isHorizontalResize = isHorizontalAxis(axis);
  var minDimensions = {};

  if (isHorizontalResize) {
    if (isHorizontalLane) {
      minDimensions = PARTICIPANT_MIN_DIMENSIONS;
    } else {
      minDimensions = {
        width: getParticipantMinWidth(participant, start, isHorizontalResize),
        height: VERTICAL_PARTICIPANT_MIN_DIMENSIONS.height
      };
    }

  } else {
    if (isHorizontalLane) {
      minDimensions = {
        width: PARTICIPANT_MIN_DIMENSIONS.width,
        height: getParticipantMinHeight(participant, start, isHorizontalResize)
      };
    } else {
      minDimensions = VERTICAL_PARTICIPANT_MIN_DIMENSIONS;
    }
  }

  return minDimensions;
}

/**
 * Get minimum height for participant taking lanes into account.
 *
 * @param {Shape} participant
 * @param {number} start
 * @param {boolean} isHorizontalResize
 *
 * @return {number}
 */
function getParticipantMinHeight(participant, start, isHorizontalResize) {
  var lanesMinHeight;
  lanesMinHeight = getLanesMinHeight(participant, start, isHorizontalResize);
  return max(PARTICIPANT_MIN_DIMENSIONS.height, lanesMinHeight);
}

/**
 * Get minimum width for participant taking lanes into account.
 *
 * @param {Shape} participant
 * @param {number} start
 * @param {boolean} isHorizontalResize
 *
 * @return {number}
 */
function getParticipantMinWidth(participant, start, isHorizontalResize) {
  var lanesMinWidth;
  lanesMinWidth = getLanesMinWidth(participant, start, isHorizontalResize);
  return max(VERTICAL_PARTICIPANT_MIN_DIMENSIONS.width, lanesMinWidth);
}

function hasChildLanes(element) {
  return !!getChildLanes(element).length;
}

function getLanesMinHeight(participant, resizeStart, isHorizontalResize) {
  var lanes = getChildLanes(participant),
      resizedLane;

  // find the nested lane which is currently resized
  resizedLane = findResizedLane(lanes, resizeStart, isHorizontalResize);

  // resized lane cannot shrink below the minimum height
  // but remaining lanes' dimensions are kept intact
  return participant.height - resizedLane.height + LANE_MIN_DIMENSIONS.height;
}

function getLanesMinWidth(participant, resizeStart, isHorizontalResize) {
  var lanes = getChildLanes(participant),
      resizedLane;

  // find the nested lane which is currently resized
  resizedLane = findResizedLane(lanes, resizeStart, isHorizontalResize);

  // resized lane cannot shrink below the minimum width
  // but remaining lanes' dimensions are kept intact
  return participant.width - resizedLane.width + VERTICAL_LANE_MIN_DIMENSIONS.width;
}

/**
 * Find nested lane which is currently resized.
 *
 * @param {Shape[]} lanes
 * @param {number} resizeStart
 * @param {boolean} isHorizontalResize
 *
 * @return {Shape}
 */
function findResizedLane(lanes, resizeStart, isHorizontalResize) {
  var i, lane, childLanes;

  for (i = 0; i < lanes.length; i++) {
    lane = lanes[i];

    // resizing current lane or a lane nested
    if (!isHorizontalResize && resizeStart >= lane.y && resizeStart <= lane.y + lane.height ||
        isHorizontalResize && resizeStart >= lane.x && resizeStart <= lane.x + lane.width) {

      childLanes = getChildLanes(lane);

      // a nested lane is resized
      if (childLanes.length) {
        return findResizedLane(childLanes, resizeStart, isHorizontalResize);
      }

      // current lane is the resized one
      return lane;
    }
  }
}
