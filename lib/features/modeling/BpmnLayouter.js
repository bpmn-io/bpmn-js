import inherits from 'inherits';

import {
  assign
} from 'min-dash';

import BaseLayouter from 'diagram-js/lib/layout/BaseLayouter';

import {
  repairConnection,
  withoutRedundantPoints
} from 'diagram-js/lib/layout/ManhattanLayout';

import {
  getMid,
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  isExpanded
} from '../../util/DiUtil';

import { is } from '../../util/ModelUtil';


var BOUNDARY_TO_HOST_THRESHOLD = 40;

export default function BpmnLayouter() {}

inherits(BpmnLayouter, BaseLayouter);


BpmnLayouter.prototype.layoutConnection = function(connection, hints) {
  hints = hints || {};

  var source = hints.source || connection.source,
      target = hints.target || connection.target,
      waypoints = connection.waypoints,
      start = hints.connectionStart,
      end = hints.connectionEnd;

  var manhattanOptions,
      updatedWaypoints;

  if (!start) {
    start = getConnectionDocking(waypoints && waypoints[0], source);
  }

  if (!end) {
    end = getConnectionDocking(waypoints && waypoints[waypoints.length - 1], target);
  }

  // TODO(nikku): support vertical modeling
  // and invert preferredLayouts accordingly

  if (is(connection, 'bpmn:Association') ||
      is(connection, 'bpmn:DataAssociation')) {

    if (waypoints && !isCompensationAssociation(source, target)) {
      return [].concat([ start ], waypoints.slice(1, -1), [ end ]);
    }
  }

  // manhattan layout sequence / message flows
  if (is(connection, 'bpmn:MessageFlow')) {
    manhattanOptions = getMessageFlowManhattanOptions(source, target);

  } else


  // layout all connection between flow elements h:h,
  //
  // except for
  //
  // (1) outgoing of BoundaryEvents -> layout based on attach orientation and target orientation
  // (2) incoming / outgoing of Gateway -> v:h (outgoing), h:v (incoming)
  // (3) loops from / to the same element
  //
  if (is(connection, 'bpmn:SequenceFlow') ||
      isCompensationAssociation(source, target)) {

    if (source === target) {
      manhattanOptions = {
        preferredLayouts: getLoopPreferredLayout(source, connection)
      };
    } else

    if (is(source, 'bpmn:BoundaryEvent')) {

      manhattanOptions = {
        preferredLayouts: getBoundaryEventPreferredLayouts(source, target, end)
      };

    } else

    if (is(source, 'bpmn:Gateway')) {

      manhattanOptions = {
        preferredLayouts: [ 'v:h' ]
      };
    } else

    if (is(target, 'bpmn:Gateway')) {

      manhattanOptions = {
        preferredLayouts: [ 'h:v' ]
      };
    }

    else {
      manhattanOptions = {
        preferredLayouts: [ 'h:h' ]
      };
    }

  }

  if (manhattanOptions) {

    manhattanOptions = assign(manhattanOptions, hints);

    updatedWaypoints =
      withoutRedundantPoints(
        repairConnection(
          source, target,
          start, end,
          waypoints,
          manhattanOptions
        )
      );
  }

  return updatedWaypoints || [ start, end ];
};


function getAttachOrientation(attachedElement) {

  var hostElement = attachedElement.host,
      padding = -10;

  return getOrientation(getMid(attachedElement), hostElement, padding);
}


function getMessageFlowManhattanOptions(source, target) {
  return {
    preferredLayouts: [ 'straight', 'v:v' ],
    preserveDocking: getMessageFlowPreserveDocking(source, target)
  };
}


function getMessageFlowPreserveDocking(source, target) {

  // (1) docking element connected to participant has precedence

  if (is(target, 'bpmn:Participant')) {
    return 'source';
  }

  if (is(source, 'bpmn:Participant')) {
    return 'target';
  }

  // (2) docking element connected to expanded sub-process has precedence

  if (isExpandedSubProcess(target)) {
    return 'source';
  }

  if (isExpandedSubProcess(source)) {
    return 'target';
  }

  // (3) docking event has precedence

  if (is(target, 'bpmn:Event')) {
    return 'target';
  }

  if (is(source, 'bpmn:Event')) {
    return 'source';
  }

  return null;
}


function getConnectionDocking(point, shape) {
  return point ? (point.original || point) : getMid(shape);
}

function isCompensationAssociation(source, target) {
  return is(target, 'bpmn:Activity') &&
         is(source, 'bpmn:BoundaryEvent') &&
         target.businessObject.isForCompensation;
}


function isExpandedSubProcess(element) {
  return is(element, 'bpmn:SubProcess') && isExpanded(element);
}

function isSame(a, b) {
  return a === b;
}

function isAnyOrientation(orientation, orientations) {
  return orientations.indexOf(orientation) !== -1;
}

var oppositeOrientationMapping = {
  'top': 'bottom',
  'top-right': 'bottom-left',
  'top-left': 'bottom-right',
  'right': 'left',
  'bottom': 'top',
  'bottom-right': 'top-left',
  'bottom-left': 'top-right',
  'left': 'right'
};

var orientationDirectionMapping = {
  top: 't',
  right: 'r',
  bottom: 'b',
  left: 'l'
};

function getHorizontalOrientation(orientation) {
  var matches = /right|left/.exec(orientation);

  return matches && matches[0];
}

function getVerticalOrientation(orientation) {
  var matches = /top|bottom/.exec(orientation);

  return matches && matches[0];
}

function isOppositeOrientation(a, b) {
  return oppositeOrientationMapping[a] === b;
}

function isOppositeHorizontalOrientation(a, b) {
  var horizontalOrientation = getHorizontalOrientation(a);

  var oppositeHorizontalOrientation = oppositeOrientationMapping[horizontalOrientation];

  return b.indexOf(oppositeHorizontalOrientation) !== -1;
}

function isOppositeVerticalOrientation(a, b) {
  var verticalOrientation = getVerticalOrientation(a);

  var oppositeVerticalOrientation = oppositeOrientationMapping[verticalOrientation];

  return b.indexOf(oppositeVerticalOrientation) !== -1;
}

function isHorizontalOrientation(orientation) {
  return orientation === 'right' || orientation === 'left';
}

function getLoopPreferredLayout(source, connection) {
  var waypoints = connection.waypoints;

  var orientation = waypoints && waypoints.length && getOrientation(waypoints[0], source);

  if (orientation === 'top') {
    return [ 't:r' ];
  } else if (orientation === 'right') {
    return [ 'r:b' ];
  } else if (orientation === 'left') {
    return [ 'l:t' ];
  }

  return [ 'b:l' ];
}

function getBoundaryEventPreferredLayouts(source, target, end) {
  var sourceMid = getMid(source),
      targetMid = getMid(target),
      attachOrientation = getAttachOrientation(source),
      sourceLayout,
      targetLayout;

  var isLoop = isSame(source.host, target);

  var attachedToSide = isAnyOrientation(attachOrientation, [ 'top', 'right', 'bottom', 'left' ]);

  var targetOrientation = getOrientation(targetMid, sourceMid, {
    x: source.width / 2 + target.width / 2,
    y: source.height / 2 + target.height / 2
  });

  if (isLoop) {
    return getBoundaryEventLoopLayout(attachOrientation, attachedToSide, source, target, end);
  }

  // source layout
  sourceLayout = getBoundaryEventSourceLayout(attachOrientation, targetOrientation, attachedToSide);

  // target layout
  targetLayout = getBoundaryEventTargetLayout(attachOrientation, targetOrientation, attachedToSide);

  return [ sourceLayout + ':' + targetLayout ];
}

function getBoundaryEventLoopLayout(attachOrientation, attachedToSide, source, target, end) {

  var sourceLayout = orientationDirectionMapping[attachedToSide ? attachOrientation : getVerticalOrientation(attachOrientation)],
      targetLayout;

  if (attachedToSide) {
    if (isHorizontalOrientation(attachOrientation)) {
      targetLayout = shouldConnectToSameSide('y', source, target, end) ? 'h' : 'b';
    } else {
      targetLayout = shouldConnectToSameSide('x', source, target, end) ? 'v' : 'l';
    }
  } else {
    targetLayout = 'v';
  }

  return [ sourceLayout + ':' + targetLayout ];
}

function shouldConnectToSameSide(axis, source, target, end) {
  var threshold = BOUNDARY_TO_HOST_THRESHOLD;

  return !(
    areCloseOnAxis(axis, end, target, threshold) ||
    areCloseOnAxis(axis, end, { x: target.x + target.width, y: target.y + target.height }, threshold) ||
    areCloseOnAxis(axis, end, getMid(source), threshold)
  );
}

function areCloseOnAxis(axis, a, b, threshold) {
  return Math.abs(a[axis] - b[axis]) < threshold;
}

function getBoundaryEventSourceLayout(attachOrientation, targetOrientation, attachedToSide) {

  // attached to either top, right, bottom or left side
  if (attachedToSide) {
    return orientationDirectionMapping[attachOrientation];
  }

  // attached to either top-right, top-left, bottom-right or bottom-left corner

  // same vertical or opposite horizontal orientation
  if (isSame(
    getVerticalOrientation(attachOrientation), getVerticalOrientation(targetOrientation)
  ) || isOppositeOrientation(
    getHorizontalOrientation(attachOrientation), getHorizontalOrientation(targetOrientation)
  )) {
    return orientationDirectionMapping[getVerticalOrientation(attachOrientation)];
  }

  // fallback
  return orientationDirectionMapping[getHorizontalOrientation(attachOrientation)];
}

function getBoundaryEventTargetLayout(attachOrientation, targetOrientation, attachedToSide) {

  // attached to either top, right, bottom or left side
  if (attachedToSide) {
    if (isHorizontalOrientation(attachOrientation)) {

      // orientation is 'right' or 'left'

      // opposite horizontal orientation or same orientation
      if (
        isOppositeHorizontalOrientation(attachOrientation, targetOrientation) ||
        isSame(attachOrientation, targetOrientation)
      ) {
        return 'h';
      }

      // fallback
      return 'v';
    } else {

      // orientation is 'top' or 'bottom'

      // opposite vertical orientation or same orientation
      if (
        isOppositeVerticalOrientation(attachOrientation, targetOrientation) ||
        isSame(attachOrientation, targetOrientation)
      ) {
        return 'v';
      }

      // fallback
      return 'h';
    }
  }

  // attached to either top-right, top-left, bottom-right or bottom-left corner

  // orientation is 'right', 'left'
  // or same vertical orientation but also 'right' or 'left'
  if (isHorizontalOrientation(targetOrientation) ||
    (isSame(getVerticalOrientation(attachOrientation), getVerticalOrientation(targetOrientation)) &&
      getHorizontalOrientation(targetOrientation))) {
    return 'h';
  } else {
    return 'v';
  }
}
