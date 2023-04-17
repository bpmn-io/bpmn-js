import {
  mid,
  setSnapped
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { isCmd } from 'diagram-js/lib/features/keyboard/KeyboardUtil';

import {
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import { is } from '../../util/ModelUtil';

import { isAny } from '../modeling/util/ModelingUtil';

import { some } from 'min-dash';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('diagram-js/lib/core/EventBus').Event} Event
 *
 * @typedef {import('../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Axis} Axis
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 */

var HIGHER_PRIORITY = 1250;

var BOUNDARY_TO_HOST_THRESHOLD = 40;

var TARGET_BOUNDS_PADDING = 20,
    TASK_BOUNDS_PADDING = 10;

var TARGET_CENTER_PADDING = 20;

var AXES = [ 'x', 'y' ];

var abs = Math.abs;

/**
 * Snap during connect.
 *
 * @param {EventBus} eventBus
 */
export default function BpmnConnectSnapping(eventBus) {
  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end',
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        canExecute = context.canExecute,
        start = context.start,
        hover = context.hover,
        source = context.source,
        target = context.target;

    // do NOT snap on CMD
    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (!context.initialConnectionStart) {
      context.initialConnectionStart = context.connectionStart;
    }

    // snap hover
    if (canExecute && hover) {
      snapToShape(event, hover, getTargetBoundsPadding(hover));
    }

    if (hover && isAnyType(canExecute, [
      'bpmn:Association',
      'bpmn:DataInputAssociation',
      'bpmn:DataOutputAssociation',
      'bpmn:SequenceFlow'
    ])) {
      context.connectionStart = mid(start);

      // snap hover
      if (isAny(hover, [ 'bpmn:Event', 'bpmn:Gateway' ])) {
        snapToPosition(event, mid(hover));
      }

      // snap hover
      if (isAny(hover, [ 'bpmn:Task', 'bpmn:SubProcess' ])) {
        snapToTargetMid(event, hover);
      }

      // snap source and target
      if (is(source, 'bpmn:BoundaryEvent') && target === source.host) {
        snapBoundaryEventLoop(event);
      }

    } else if (isType(canExecute, 'bpmn:MessageFlow')) {

      if (is(start, 'bpmn:Event')) {

        // snap start
        context.connectionStart = mid(start);
      }

      if (is(hover, 'bpmn:Event')) {

        // snap hover
        snapToPosition(event, mid(hover));
      }

    } else {

      // un-snap source
      context.connectionStart = context.initialConnectionStart;
    }
  });
}

BpmnConnectSnapping.$inject = [ 'eventBus' ];


// helpers //////////

/**
 * Snap to the given target if the event is inside the bounds of the target.
 *
 * @param {Event} event
 * @param {Shape} target
 * @param {number} padding
 */
function snapToShape(event, target, padding) {
  AXES.forEach(function(axis) {
    var dimensionForAxis = getDimensionForAxis(axis, target);

    if (event[ axis ] < target[ axis ] + padding) {
      setSnapped(event, axis, target[ axis ] + padding);
    } else if (event[ axis ] > target[ axis ] + dimensionForAxis - padding) {
      setSnapped(event, axis, target[ axis ] + dimensionForAxis - padding);
    }
  });
}

/**
 * Snap to the target mid if the event is in the target mid.
 *
 * @param {Event} event
 * @param {Shape} target
 */
function snapToTargetMid(event, target) {
  var targetMid = mid(target);

  AXES.forEach(function(axis) {
    if (isMid(event, target, axis)) {
      setSnapped(event, axis, targetMid[ axis ]);
    }
  });
}

/**
 * Snap to prevent a loop overlapping a boundary event.
 *
 * @param {Event} event
 */
function snapBoundaryEventLoop(event) {
  var context = event.context,
      source = context.source,
      target = context.target;

  if (isReverse(context)) {
    return;
  }

  var sourceMid = mid(source),
      orientation = getOrientation(sourceMid, target, -10),
      axes = [];

  if (/top|bottom/.test(orientation)) {
    axes.push('x');
  }

  if (/left|right/.test(orientation)) {
    axes.push('y');
  }

  axes.forEach(function(axis) {
    var coordinate = event[ axis ], newCoordinate;

    if (abs(coordinate - sourceMid[ axis ]) < BOUNDARY_TO_HOST_THRESHOLD) {
      if (coordinate > sourceMid[ axis ]) {
        newCoordinate = sourceMid[ axis ] + BOUNDARY_TO_HOST_THRESHOLD;
      }
      else {
        newCoordinate = sourceMid[ axis ] - BOUNDARY_TO_HOST_THRESHOLD;
      }

      setSnapped(event, axis, newCoordinate);
    }
  });
}

/**
 * @param {Event} event
 * @param {Point} position
 */
function snapToPosition(event, position) {
  setSnapped(event, 'x', position.x);
  setSnapped(event, 'y', position.y);
}

function isType(attrs, type) {
  return attrs && attrs.type === type;
}

function isAnyType(attrs, types) {
  return some(types, function(type) {
    return isType(attrs, type);
  });
}

/**
 * @param {Axis} axis
 * @param {Shape} element
 *
 * @return {number}
 */
function getDimensionForAxis(axis, element) {
  return axis === 'x' ? element.width : element.height;
}

/**
 * @param {Shape} target
 *
 * @return {number}
 */
function getTargetBoundsPadding(target) {
  if (is(target, 'bpmn:Task')) {
    return TASK_BOUNDS_PADDING;
  } else {
    return TARGET_BOUNDS_PADDING;
  }
}

/**
 * @param {Event} event
 * @param {Shape} target
 * @param {Axis} axis
 *
 * @return {boolean}
 */
function isMid(event, target, axis) {
  return event[ axis ] > target[ axis ] + TARGET_CENTER_PADDING
    && event[ axis ] < target[ axis ] + getDimensionForAxis(axis, target) - TARGET_CENTER_PADDING;
}

function isReverse(context) {
  var hover = context.hover,
      source = context.source;

  return hover && source && hover === source;
}