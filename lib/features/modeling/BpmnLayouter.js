import inherits from 'inherits';

import {
  assign
} from 'min-dash';

import BaseLayouter from 'diagram-js/lib/layout/BaseLayouter';

import {
  repairConnection
} from 'diagram-js/lib/layout/ManhattanLayout';

import {
  getMid,
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  isExpanded
} from '../../util/DiUtil';

import { is } from '../../util/ModelUtil';


export default function BpmnLayouter() {}

inherits(BpmnLayouter, BaseLayouter);


BpmnLayouter.prototype.layoutConnection = function(connection, hints) {
  hints = hints || {};

  var source = connection.source,
      target = connection.target,
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

    if (waypoints && !isCompensationAssociation(connection)) {
      return [].concat([ start ], waypoints.slice(1, -1), [ end ]);
    }
  }

  // manhattan layout sequence / message flows
  if (is(connection, 'bpmn:MessageFlow')) {
    manhattanOptions = {
      preferredLayouts: [ 'v:v' ]
    };

    if (is(target, 'bpmn:Participant')) {
      manhattanOptions = {
        preferredLayouts: [ 'straight', 'v:v' ]
      };
    }

    if (isExpandedSubProcess(target)) {
      manhattanOptions = {
        preferredLayouts: [ 'straight', 'v:v' ]
      };
    }

    if (isExpandedSubProcess(source) && is(target, 'bpmn:FlowNode')) {
      manhattanOptions = {
        preferredLayouts: [ 'straight', 'v:v' ],
        preserveDocking: isExpandedSubProcess(target) ? 'source' : 'target'
      };
    }

    if (is(source, 'bpmn:Participant') && is(target, 'bpmn:FlowNode')) {
      manhattanOptions = {
        preferredLayouts: [ 'straight', 'v:v' ],
        preserveDocking: 'target'
      };
    }

    if (is(target, 'bpmn:Event')) {
      manhattanOptions = {
        preferredLayouts: [ 'v:v' ]
      };
    }
  } else


  // layout all connection between flow elements h:h,
  //
  // except for
  //
  // (1) outgoing of BoundaryEvents -> layout based on attach orientation and target orientation
  // (2) incoming / outgoing of Gateway -> v:h (outgoing), h:v (incoming)
  //
  if (is(connection, 'bpmn:SequenceFlow') ||
      isCompensationAssociation(connection)) {

    if (is(source, 'bpmn:BoundaryEvent')) {

      var sourceMid = getMid(source),
          targetMid = getMid(target),
          attachOrientation = getAttachOrientation(source),
          preferredLayouts;

      var isLoop = isSame(source.host, target);

      var attachedToSide = isAnyOrientation(attachOrientation, [ 'top', 'right', 'bottom', 'left' ]),
          attachedToCorner = isAnyOrientation(attachOrientation, [ 'top-right', 'top-left', 'bottom-right', 'bottom-left' ]);

      var isHorizontalAttachOrientation = isHorizontalOrientation(attachOrientation);

      var targetOrientation = getOrientation(targetMid, sourceMid, {
        x: source.width / 2 + target.width / 2,
        y: source.height / 2 + target.height / 2
      });

      // attached to either top, right, bottom or left side
      if (attachedToSide) {

        // same orientation
        if (isSame(attachOrientation, targetOrientation)) {
          preferredLayouts = isHorizontalAttachOrientation ? [ 'h:h' ] : [ 'v:v' ];
        } else

        // loop, opposite direction or opposite horizontal/vertical orientation
        if (
          isLoop ||
          isOppositeOrientation(attachOrientation, targetOrientation) ||
          (isHorizontalAttachOrientation ?
            isOppositeHorizontalOrientation(attachOrientation, targetOrientation) :
            isOppositeVerticalOrientation(attachOrientation, targetOrientation))
        ) {
          preferredLayouts = [
            orientationDirectionMapping[
              isHorizontalAttachOrientation ?
                getHorizontalOrientation(attachOrientation) :
                getVerticalOrientation(attachOrientation)] +
            ':' +
            (isHorizontalAttachOrientation ? 'h' : 'v')
          ];
        } else {
          preferredLayouts = [
            orientationDirectionMapping[
              isHorizontalAttachOrientation ?
                getHorizontalOrientation(attachOrientation) :
                getVerticalOrientation(attachOrientation)] +
            ':' +
            (isHorizontalAttachOrientation ? 'v' : 'h')
          ];
        }

      } else

      // attached to either top-right, top-left, bottom-right or bottom-left corner
      if (attachedToCorner) {

        // loop, opposite corner or same vertical orientation
        if (isLoop ||
          isOppositeOrientation(attachOrientation, targetOrientation) ||
          (isVerticalOrientation(targetOrientation) &&
            isSame(getVerticalOrientation(attachOrientation), getVerticalOrientation(targetOrientation)))
        ) {
          preferredLayouts = [
            orientationDirectionMapping[getVerticalOrientation(attachOrientation)] +
            ':v'
          ];
        } else

        // opposite horizontal orientation or same orientation
        if (isOppositeOrientation(getHorizontalOrientation(attachOrientation), getHorizontalOrientation(targetOrientation)) ||
          isSame(attachOrientation, targetOrientation)) {
          preferredLayouts = [
            orientationDirectionMapping[getVerticalOrientation(attachOrientation)] +
            ':h'
          ];
        } else

        // opposite vertical orientation and same horizontal orientation or opposite vertical orientation
        if (isSame(getHorizontalOrientation(attachOrientation), getHorizontalOrientation(targetOrientation)) &&
          isOppositeVerticalOrientation(attachOrientation, targetOrientation) ||
          isOppositeOrientation(getVerticalOrientation(attachOrientation), targetOrientation)
        ) {
          preferredLayouts = [
            orientationDirectionMapping[getHorizontalOrientation(attachOrientation)] +
            ':v'
          ];
        } else

        // same horizontal orientation
        if (isSame(getHorizontalOrientation(attachOrientation), getHorizontalOrientation(targetOrientation))) {
          preferredLayouts = [
            orientationDirectionMapping[getHorizontalOrientation(attachOrientation)] +
            ':h'
          ];
        }

      }

      manhattanOptions = {
        preferredLayouts: preferredLayouts
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
      repairConnection(
        source, target,
        start, end,
        waypoints,
        manhattanOptions);
  }

  return updatedWaypoints || [ start, end ];
};


function getAttachOrientation(attachedElement) {

  var hostElement = attachedElement.host,
      padding = -10;

  return getOrientation(getMid(attachedElement), hostElement, padding);
}


function getConnectionDocking(point, shape) {
  return point ? (point.original || point) : getMid(shape);
}

function isCompensationAssociation(connection) {

  var source = connection.source,
      target = connection.target;

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

function isVerticalOrientation(orientation) {
  return orientation === 'top' || orientation === 'bottom';
}