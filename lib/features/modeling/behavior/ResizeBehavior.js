import { is } from '../../../util/ModelUtil';

import {
  isExpanded,
  isHorizontal
} from '../../../util/DiUtil';

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
export var VERTICAL_LANE_MIN_DIMENSIONS = { width: 60, height: 300 };

/**
 * @type {Dimensions}
 */
export var PARTICIPANT_MIN_DIMENSIONS = { width: 300, height: 150 };

/**
 * @type {Dimensions}
 */
export var VERTICAL_PARTICIPANT_MIN_DIMENSIONS = { width: 150, height: 300 };

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

var LANE_PADDING = { top: 20, left: 50, right: 20, bottom: 20 },
    VERTICAL_LANE_PADDING = { top: 50, left: 20, right: 20, bottom: 20 };

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

  var allLanes = collectLanes(lanesRoot, [ lanesRoot ]);

  var laneTrbl = asTRBL(laneShape);

  var maxTrbl = {},
      minTrbl = {};

  var isHorizontalLane = isHorizontal(laneShape);

  var minDimensions = isHorizontalLane ? LANE_MIN_DIMENSIONS : VERTICAL_LANE_MIN_DIMENSIONS;

  if (/n/.test(resizeDirection)) {
    minTrbl.top = laneTrbl.bottom - minDimensions.height;
  } else
  if (/e/.test(resizeDirection)) {
    minTrbl.right = laneTrbl.left + minDimensions.width;
  } else
  if (/s/.test(resizeDirection)) {
    minTrbl.bottom = laneTrbl.top + minDimensions.height;
  } else
  if (/w/.test(resizeDirection)) {
    minTrbl.left = laneTrbl.right - minDimensions.width;
  }

  // min/max size based on related lanes
  allLanes.forEach(function(other) {

    var otherTrbl = asTRBL(other);

    if (/n/.test(resizeDirection)) {
      if (isHorizontalLane && otherTrbl.top < (laneTrbl.top - 10)) {
        isFirst = false;
      }

      // max top size (based on next element)
      if (balanced && abs(laneTrbl.top - otherTrbl.bottom) < 10) {
        addMax(maxTrbl, 'top', otherTrbl.top + minDimensions.height);
      }

      // min top size (based on self or nested element)
      if (abs(laneTrbl.top - otherTrbl.top) < 5) {
        addMin(minTrbl, 'top', otherTrbl.bottom - minDimensions.height);
      }
    }

    if (/e/.test(resizeDirection)) {

      if (!isHorizontalLane && otherTrbl.right > (laneTrbl.right + 10)) {
        isLast = false;
      }

      // max right size (based on previous element)
      if (balanced && abs(laneTrbl.right - otherTrbl.left) < 10) {
        addMin(maxTrbl, 'right', otherTrbl.right - minDimensions.width);
      }

      // min right size (based on self or nested element)
      if (abs(laneTrbl.right - otherTrbl.right) < 5) {
        addMax(minTrbl, 'right', otherTrbl.left + minDimensions.width);
      }
    }

    if (/s/.test(resizeDirection)) {

      if (isHorizontalLane && otherTrbl.bottom > (laneTrbl.bottom + 10)) {
        isLast = false;
      }

      // max bottom size (based on previous element)
      if (balanced && abs(laneTrbl.bottom - otherTrbl.top) < 10) {
        addMin(maxTrbl, 'bottom', otherTrbl.bottom - minDimensions.height);
      }

      // min bottom size (based on self or nested element)
      if (abs(laneTrbl.bottom - otherTrbl.bottom) < 5) {
        addMax(minTrbl, 'bottom', otherTrbl.top + minDimensions.height);
      }
    }

    if (/w/.test(resizeDirection)) {

      if (!isHorizontalLane && otherTrbl.left < (laneTrbl.left - 10)) {
        isFirst = false;
      }

      // max left size (based on next element)
      if (balanced && abs(laneTrbl.left - otherTrbl.right) < 10) {
        addMax(maxTrbl, 'left', otherTrbl.left + minDimensions.width);
      }

      // min left size (based on self or nested element)
      if (abs(laneTrbl.left - otherTrbl.left) < 5) {
        addMin(minTrbl, 'left', otherTrbl.right - minDimensions.width);
      }
    }
  });

  // max top/bottom/left/right size based on flow nodes
  var flowElements = lanesRoot.children.filter(function(s) {
    return !s.hidden && !s.waypoints && (is(s, 'bpmn:FlowElement') || is(s, 'bpmn:Artifact'));
  });

  var padding = isHorizontalLane ? LANE_PADDING : VERTICAL_LANE_PADDING;

  flowElements.forEach(function(flowElement) {

    var flowElementTrbl = asTRBL(flowElement);

    if (isFirst && /n/.test(resizeDirection)) {
      addMin(minTrbl, 'top', flowElementTrbl.top - padding.top);
    }

    if (isLast && /e/.test(resizeDirection)) {
      addMax(minTrbl, 'right', flowElementTrbl.right + padding.right);
    }

    if (isLast && /s/.test(resizeDirection)) {
      addMax(minTrbl, 'bottom', flowElementTrbl.bottom + padding.bottom);
    }

    if (isFirst && /w/.test(resizeDirection)) {
      addMin(minTrbl, 'left', flowElementTrbl.left - padding.left);
    }
  });

  return {
    min: minTrbl,
    max: maxTrbl
  };
}