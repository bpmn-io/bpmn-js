'use strict';


var LayoutUtil = require('diagram-js/lib/layout/Util');

function Layouter() {}

module.exports = Layouter;


Layouter.prototype.getConnectionWaypoints = function(connection) {
  return [
    LayoutUtil.getMidPoint(connection.source),
    LayoutUtil.getMidPoint(connection.target)
  ];
};