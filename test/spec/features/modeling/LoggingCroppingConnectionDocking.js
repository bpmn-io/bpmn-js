'use strict';

var CroppingConnectionDocking = require('diagram-js/lib/layout/CroppingConnectionDocking');

var getOrientation = require('diagram-js/lib/layout/LayoutUtil').getOrientation;

var inherits = require('inherits');


function LoggingCroppingConnectionDocking(elementRegistry, graphicsFactory) {
  CroppingConnectionDocking.call(this, elementRegistry, graphicsFactory);
}

LoggingCroppingConnectionDocking.$inject = [
  'elementRegistry',
  'graphicsFactory'
];

inherits(LoggingCroppingConnectionDocking, CroppingConnectionDocking);

module.exports = LoggingCroppingConnectionDocking;

window.noIntersectCount = 0;

window.noIntersect = [];

LoggingCroppingConnectionDocking.prototype._getIntersection = function(shape, connection, takeFirst) {

  var intersection = CroppingConnectionDocking.prototype._getIntersection.call(this, shape, connection, takeFirst);

  if (!intersection) {

    if (getOrientation(connection.source, connection.target) !== 'intersect') {
      window.noIntersectCount++;

      window.noIntersect.push([
        connection,
        this._getShapePath(shape),
        this._getConnectionPath(connection)
      ]);
    }
  }

  return intersection;
};