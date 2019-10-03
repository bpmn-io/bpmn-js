import {
  mid,
  setSnapped
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { isCmd } from 'diagram-js/lib/features/keyboard/KeyboardUtil';

import {
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  is,
  isAny
} from '../../util/ModelUtil';

import {
  some
} from 'min-dash';

var HIGHER_PRIORITY = 1250;

var BOUNDARY_TO_HOST_THRESHOLD = 40;

var TARGET_BOUNDS_PADDING = 20;

var TARGET_CENTER_PADDING = 20;

var TASK_BOUNDS_PADDING = 10;

var AXES = [ 'x', 'y' ];

var abs = Math.abs;

/**
 * Snap during connect.
 *
 * @param {EventBus} eventBus
 * @param {Rules} rules
 */
export default function BpmnConnectSnapping(eventBus, rules) {
  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end',
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        source = context.source,
        target = context.target;

    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (!context.initialSourcePosition) {
      context.initialSourcePosition = context.sourcePosition;
    }

    var connectionAttrs = rules.allowed('connection.create', {
      source: source,
      target: target
    });

    if (target && connectionAttrs) {
      snapInsideTarget(event, target, getTargetBoundsPadding(target));
    }

    if (target && isAnyType(connectionAttrs, [
      'bpmn:Association',
      'bpmn:DataInputAssociation',
      'bpmn:DataOutputAssociation',
      'bpmn:SequenceFlow'
    ])) {

      // snap source
      context.sourcePosition = mid(source);

      if (isAny(target, [ 'bpmn:Event', 'bpmn:Gateway' ])) {
        snapToPosition(event, mid(target));
      }

      if (isAny(target, [ 'bpmn:Task', 'bpmn:SubProcess' ])) {
        snapToTaskMid(event, target);
      }

      if (is(source, 'bpmn:BoundaryEvent') && target === source.host) {
        snapBoundaryEventLoop(event, source, target);
      }

    } else if (isType(connectionAttrs, 'bpmn:MessageFlow')) {

      if (is(source, 'bpmn:Event')) {

        // snap source
        context.sourcePosition = mid(source);
      }

      if (is(target, 'bpmn:Event')) {

        // snap target
        snapToPosition(event, mid(target));
      }

    } else {

      // un-snap source
      context.sourcePosition = context.initialSourcePosition;
    }
  });
}

BpmnConnectSnapping.$inject = [
  'eventBus',
  'rules'
];

function snapInsideTarget(event, target, padding) {

  AXES.forEach(function(axis) {
    var matchingTargetDimension = getDimensionForAxis(axis, target),
        newCoordinate;

    if (event[axis] < target[axis] + padding) {
      newCoordinate = target[axis] + padding;
    } else if (event[axis] > target[axis] + matchingTargetDimension - padding) {
      newCoordinate = target[axis] + matchingTargetDimension - padding;
    }

    if (newCoordinate) {
      setSnapped(event, axis, newCoordinate);
    }
  });
}

// snap to target mid if event in center
function snapToTaskMid(event, target) {
  var targetMid = mid(target);

  AXES.forEach(function(axis) {
    if (isCenter(event, target, axis)) {
      setSnapped(event, axis, targetMid[ axis ]);
    }
  });
}

// snap outside of Boundary Event surroundings
function snapBoundaryEventLoop(event, source, target) {
  var sourceMid = mid(source),
      orientation = getOrientation(sourceMid, target, -10),
      snappingAxes = [];

  if (/top|bottom/.test(orientation)) {
    snappingAxes.push('x');
  }

  if (/left|right/.test(orientation)) {
    snappingAxes.push('y');
  }

  snappingAxes.forEach(function(axis) {
    var coordinate = event[axis], newCoordinate;

    if (abs(coordinate - sourceMid[axis]) < BOUNDARY_TO_HOST_THRESHOLD) {
      if (coordinate > sourceMid[axis]) {
        newCoordinate = sourceMid[axis] + BOUNDARY_TO_HOST_THRESHOLD;
      }
      else {
        newCoordinate = sourceMid[axis] - BOUNDARY_TO_HOST_THRESHOLD;
      }

      setSnapped(event, axis, newCoordinate);
    }
  });
}

// helpers //////////

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

function getDimensionForAxis(axis, element) {
  return axis === 'x' ? element.width : element.height;
}

function getTargetBoundsPadding(target) {
  if (is(target, 'bpmn:Task')) {
    return TASK_BOUNDS_PADDING;
  } else {
    return TARGET_BOUNDS_PADDING;
  }
}

function isCenter(event, target, axis) {
  return event[ axis ] > target[ axis ] + TARGET_CENTER_PADDING
    && event[ axis ] < target[ axis ] + getDimensionForAxis(axis, target) - TARGET_CENTER_PADDING;
}
