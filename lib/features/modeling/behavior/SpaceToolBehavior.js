import {
  forEach,
  reduce
} from 'min-dash';

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

/**
 * Get minimum height for participant taking lanes into account.
 *
 * @param {<djs.model.Shape>} participant
 * @param {number} start
 *
 * @returns {Object}
 */
function getParticipantMinHeight(participant, start) {
  var lanes = getChildLanes(participant);

  if (!lanes.length) {
    return PARTICIPANT_MIN_DIMENSIONS.height;
  }

  function getLanesMinHeight(element) {
    return reduce(getChildLanes(element), function(minHeight, lane) {
      if (start >= lane.y && start <= lane.y + lane.height) {

        // resizing lane
        if (hasChildLanes(lane)) {
          minHeight += getLanesMinHeight(lane);
        } else {
          minHeight += lane.y + LANE_MIN_DIMENSIONS.height - participant.y;
        }
      } else if (start <= lane.y) {

        // lane after resizing lane
        minHeight += lane.height;
      }

      return minHeight;
    }, 0);
  }

  return max(PARTICIPANT_MIN_DIMENSIONS.height, getLanesMinHeight(participant));
}

function hasChildLanes(element) {
  return !!getChildLanes(element).length;
}

function isHorizontal(axis) {
  return axis === 'x';
}