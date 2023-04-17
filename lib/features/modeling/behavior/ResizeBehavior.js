import { is } from '../../../util/ModelUtil';

import { isExpanded } from '../../../util/DiUtil';

import {
  asTRBL
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  collectLanes,
  getLanesRoot
} from '../util/LaneUtil';

var HIGH_PRIORITY = 1500;

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Dimensions} Dimensions
 * @typedef {import('diagram-js/lib/util/Types').Direction} Direction
 * @typedef {import('diagram-js/lib/util/Types').RectTRBL} RectTRBL
 */

/**
 * @type {Dimensions}
 */
export var GROUP_MIN_DIMENSIONS = { width: 140, height: 120 };

/**
 * @type {Dimensions}
 */
export var LANE_MIN_DIMENSIONS = { width: 300, height: 60 };

/**
 * @type {Dimensions}
 */
export var PARTICIPANT_MIN_DIMENSIONS = { width: 300, height: 150 };

/**
 * @type {Dimensions}
 */
export var SUB_PROCESS_MIN_DIMENSIONS = { width: 140, height: 120 };

/**
 * @type {Dimensions}
 */
export var TEXT_ANNOTATION_MIN_DIMENSIONS = { width: 50, height: 30 };

/**
 * Set minimum bounds/resize constraints on resize.
 *
 * @param {EventBus} eventBus
 */
export default function ResizeBehavior(eventBus) {
  eventBus.on('resize.start', HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        direction = context.direction,
        balanced = context.balanced;

    if (is(shape, 'bpmn:Lane') || is(shape, 'bpmn:Participant')) {
      context.resizeConstraints = getParticipantResizeConstraints(shape, direction, balanced);
    }

    if (is(shape, 'bpmn:Participant')) {
      context.minDimensions = PARTICIPANT_MIN_DIMENSIONS;
    }

    if (is(shape, 'bpmn:SubProcess') && isExpanded(shape)) {
      context.minDimensions = SUB_PROCESS_MIN_DIMENSIONS;
    }

    if (is(shape, 'bpmn:TextAnnotation')) {
      context.minDimensions = TEXT_ANNOTATION_MIN_DIMENSIONS;
    }
  });
}

ResizeBehavior.$inject = [ 'eventBus' ];


var abs = Math.abs,
    min = Math.min,
    max = Math.max;


function addToTrbl(trbl, attr, value, choice) {
  var current = trbl[attr];

  // make sure to set the value if it does not exist
  // or apply the correct value by comparing against
  // choice(value, currentValue)
  trbl[attr] = current === undefined ? value : choice(value, current);
}

function addMin(trbl, attr, value) {
  return addToTrbl(trbl, attr, value, min);
}

function addMax(trbl, attr, value) {
  return addToTrbl(trbl, attr, value, max);
}

var LANE_RIGHT_PADDING = 20,
    LANE_LEFT_PADDING = 50,
    LANE_TOP_PADDING = 20,
    LANE_BOTTOM_PADDING = 20;

/**
 * @param {Shape} laneShape
 * @param {Direction} resizeDirection
 * @param {boolean} [balanced=false]
 *
 * @return { {
 *   min: RectTRBL;
 *   max: RectTRBL;
 * } }
 */
export function getParticipantResizeConstraints(laneShape, resizeDirection, balanced) {
  var lanesRoot = getLanesRoot(laneShape);

  var isFirst = true,
      isLast = true;

  // max top/bottom size for lanes
  var allLanes = collectLanes(lanesRoot, [ lanesRoot ]);

  var laneTrbl = asTRBL(laneShape);

  var maxTrbl = {},
      minTrbl = {};

  if (/e/.test(resizeDirection)) {
    minTrbl.right = laneTrbl.left + LANE_MIN_DIMENSIONS.width;
  } else
  if (/w/.test(resizeDirection)) {
    minTrbl.left = laneTrbl.right - LANE_MIN_DIMENSIONS.width;
  }

  allLanes.forEach(function(other) {

    var otherTrbl = asTRBL(other);

    if (/n/.test(resizeDirection)) {

      if (otherTrbl.top < (laneTrbl.top - 10)) {
        isFirst = false;
      }

      // max top size (based on next element)
      if (balanced && abs(laneTrbl.top - otherTrbl.bottom) < 10) {
        addMax(maxTrbl, 'top', otherTrbl.top + LANE_MIN_DIMENSIONS.height);
      }

      // min top size (based on self or nested element)
      if (abs(laneTrbl.top - otherTrbl.top) < 5) {
        addMin(minTrbl, 'top', otherTrbl.bottom - LANE_MIN_DIMENSIONS.height);
      }
    }

    if (/s/.test(resizeDirection)) {

      if (otherTrbl.bottom > (laneTrbl.bottom + 10)) {
        isLast = false;
      }

      // max bottom size (based on previous element)
      if (balanced && abs(laneTrbl.bottom - otherTrbl.top) < 10) {
        addMin(maxTrbl, 'bottom', otherTrbl.bottom - LANE_MIN_DIMENSIONS.height);
      }

      // min bottom size (based on self or nested element)
      if (abs(laneTrbl.bottom - otherTrbl.bottom) < 5) {
        addMax(minTrbl, 'bottom', otherTrbl.top + LANE_MIN_DIMENSIONS.height);
      }
    }
  });

  // max top/bottom/left/right size based on flow nodes
  var flowElements = lanesRoot.children.filter(function(s) {
    return !s.hidden && !s.waypoints && (is(s, 'bpmn:FlowElement') || is(s, 'bpmn:Artifact'));
  });

  flowElements.forEach(function(flowElement) {

    var flowElementTrbl = asTRBL(flowElement);

    if (isFirst && /n/.test(resizeDirection)) {
      addMin(minTrbl, 'top', flowElementTrbl.top - LANE_TOP_PADDING);
    }

    if (/e/.test(resizeDirection)) {
      addMax(minTrbl, 'right', flowElementTrbl.right + LANE_RIGHT_PADDING);
    }

    if (isLast && /s/.test(resizeDirection)) {
      addMax(minTrbl, 'bottom', flowElementTrbl.bottom + LANE_BOTTOM_PADDING);
    }

    if (/w/.test(resizeDirection)) {
      addMin(minTrbl, 'left', flowElementTrbl.left - LANE_LEFT_PADDING);
    }
  });

  return {
    min: minTrbl,
    max: maxTrbl
  };
}