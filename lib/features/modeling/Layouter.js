'use strict';

var BaseLayouter = require('diagram-js/lib/features/modeling/Layouter'),
    LayoutUtil = require('diagram-js/lib/layout/Util'),
    ManhattanLayout = require('diagram-js/lib/layout/ManhattanLayout');


function Layouter() {}

Layouter.prototype = Object.create(BaseLayouter.prototype);

module.exports = Layouter;


Layouter.prototype.getConnectionWaypoints = function(connection) {
  var source = connection.source,
      start = LayoutUtil.getMidPoint(source),
      target = connection.target,
      end = LayoutUtil.getMidPoint(target);

  var bo = connection.businessObject;

  // manhattan layout sequence / message flows
  if (bo.$instanceOf('bpmn:SequenceFlow') ||
      bo.$instanceOf('bpmn:MessageFlow')) {

    var waypoints = ManhattanLayout.repairConnection(source, target, start, end, connection.waypoints);

    if (waypoints) {
      return waypoints;
    }
  }

  return [ start, end ];
};