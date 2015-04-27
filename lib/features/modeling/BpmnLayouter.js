'use strict';

var inherits = require('inherits');

var assign = require('lodash/object/assign');

var BaseLayouter = require('diagram-js/lib/layout/BaseLayouter'),
    LayoutUtil = require('diagram-js/lib/layout/LayoutUtil'),
    ManhattanLayout = require('diagram-js/lib/layout/ManhattanLayout');

var is = require('../../util/ModelUtil').is;


function BpmnLayouter() {}

inherits(BpmnLayouter, BaseLayouter);

module.exports = BpmnLayouter;


function getAttachment(waypoints, idx, shape) {
  var point = waypoints && waypoints[idx];

  return point ? (point.original || point) : LayoutUtil.getMidPoint(shape);
}


BpmnLayouter.prototype.layoutConnection = function(connection, hints) {
  var source = connection.source,
      target = connection.target,
      waypoints = connection.waypoints,
      start,
      end;

  var layoutManhattan,
      updatedWaypoints;

  start = getAttachment(waypoints, 0, source);
  end = getAttachment(waypoints, waypoints && waypoints.length - 1, target);

  // manhattan layout sequence / message flows
  if (is(connection, 'bpmn:MessageFlow')) {
    layoutManhattan = {
      preferStraight: true,
      preferVertical: true
    };
  }

  if (is(connection, 'bpmn:SequenceFlow')) {
    layoutManhattan = {};
  }

  if (layoutManhattan) {

    layoutManhattan = assign(layoutManhattan, hints);

    updatedWaypoints =
      ManhattanLayout.repairConnection(
        source, target, start, end,
        waypoints,
        layoutManhattan);
  }

  return updatedWaypoints || [ start, end ];
};