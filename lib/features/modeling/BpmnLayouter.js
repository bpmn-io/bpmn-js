'use strict';

var inherits = require('inherits');

var assign = require('lodash/object/assign');

var BaseLayouter = require('diagram-js/lib/layout/BaseLayouter'),
    ManhattanLayout = require('diagram-js/lib/layout/ManhattanLayout');

var LayoutUtil = require('diagram-js/lib/layout/LayoutUtil');

var getMid = LayoutUtil.getMid,
    getOrientation = LayoutUtil.getOrientation;

var is = require('../../util/ModelUtil').is;


function BpmnLayouter() {}

inherits(BpmnLayouter, BaseLayouter);

module.exports = BpmnLayouter;


BpmnLayouter.prototype.layoutConnection = function(connection, layoutHints) {
  var source = connection.source,
      target = connection.target,
      waypoints = connection.waypoints,
      start,
      end;

  var manhattanOptions,
      updatedWaypoints;

  start = getConnectionDocking(waypoints, 0, source);
  end = getConnectionDocking(waypoints, waypoints && waypoints.length - 1, target);

  // TODO (nre): support vertical modeling
  // and invert preferredLayouts accordingly

  if (is(connection, 'bpmn:Association') ||
      is(connection, 'bpmn:DataAssociation')) {

    if (waypoints && !isCompensationAssociation(connection)) {
      return waypoints;
    }
  }

  // manhattan layout sequence / message flows
  if (is(connection, 'bpmn:MessageFlow')) {
    manhattanOptions = {
      preferredLayouts: [ 'straight', 'v:v' ]
    };

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
  // (1) outgoing of BoundaryEvents -> layout h:v or v:h based on attach orientation
  // (2) incoming / outgoing of Gateway -> v:h (outgoing), h:v (incoming)
  //
  if (is(connection, 'bpmn:SequenceFlow') ||
      isCompensationAssociation(connection)) {

    // make sure boundary event connections do
    // not look ugly =:>
    if (is(source, 'bpmn:BoundaryEvent')) {

      var orientation = getAttachOrientation(source);

      if (/left|right/.test(orientation)) {
        manhattanOptions = {
          preferredLayouts: [ 'h:v' ]
        };
      } else

      if (/top|bottom/.test(orientation)) {
        manhattanOptions = {
          preferredLayouts: [ 'v:h' ]
        };
      }
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

    // apply horizontal love <3
    else {
      manhattanOptions = {
        preferredLayouts: [ 'h:h' ]
      };
    }
  }

  if (manhattanOptions) {

    manhattanOptions = assign(manhattanOptions, layoutHints);

    updatedWaypoints =
      ManhattanLayout.repairConnection(
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


function getConnectionDocking(waypoints, idx, shape) {
  var point = waypoints && waypoints[idx];

  return point ? (point.original || point) : getMid(shape);
}

function isCompensationAssociation(connection) {

  var source = connection.source,
      target = connection.target;

  return is(target, 'bpmn:Activity') &&
         is(source, 'bpmn:BoundaryEvent') &&
         target.businessObject.isForCompensation;
}