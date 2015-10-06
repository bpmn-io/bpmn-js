'use strict';

var pick = require('lodash/object/pick');

var POSITION_ATTRS = [ 'x', 'y' ];

function extractPoints(point) {
  return pick(point, POSITION_ATTRS);
}


module.exports = function(chai, utils) {

  var Assertion = chai.Assertion;

  function inspect(obj) {
    return utils.inspect(obj).replace(/\n /g, '');
  }

  /**
   * A simple waypoints matcher, that verifies an connection
   * consists of the correct connection points.
   *
   * Does not take the original docking into account.
   *
   * @example
   *
   * expect(connection).to.have.waypoints([ { x: 100, y: 100 }, { x: 0, y: 0 } ]);
   *
   * @param {Connection|Array<Point>} exp
   */
  Assertion.addMethod('waypoints', function(exp) {
    var obj = this._obj;

    var strippedWaypoints = obj.waypoints.map(extractPoints),
        strippedExpectedWaypoints = exp.map(extractPoints);

    var waypointsAssert = new Assertion(strippedWaypoints);

    var matches = utils.eql(strippedWaypoints, strippedExpectedWaypoints);

    var strippedWaypointsStr = inspect(strippedWaypoints, '  '),
        strippedExpectedWaypointsStr = inspect(strippedExpectedWaypoints, '  ');

    waypointsAssert.assert(
      matches,
      'expected <' + obj.id + '#waypoints> ' +
          'to equal \n  ' + strippedExpectedWaypointsStr +
          '\nbut got\n  ' + strippedWaypointsStr,
      'expected <' + obj.id + '#waypoints> ' +
          'not to equal \n  ' + strippedExpectedWaypoints
    );
  });

  /**
   * A simple waypoints matcher, that verifies an a connection
   * has the given start docking.
   *
   * @example
   *
   * expect(connection).to.have.startDocking({ x: 100, y: 100 });
   *
   * @param {Point} exp
   */
  Assertion.addMethod('startDocking', function(exp) {
    var obj = this._obj;

    var startPoint = obj.waypoints[0],
        startDocking = startPoint.original;
    var dockingAssert = new Assertion(startDocking);

    dockingAssert.assert(
      utils.eql(startDocking, exp),
      'expected <' + obj.id + '> to have start docking #{exp} but got #{act}',
      'expected <' + obj.id + '> to not have start docking #{exp}',
      exp,
      startDocking,
      true
    );
  });

  /**
   * A simple waypoints matcher, that verifies an a connection
   * has the given start docking.
   *
   * @example
   *
   * expect(connection).to.have.endDocking({ x: 100, y: 100 });
   *
   * @param {Point} exp
   */
  Assertion.addMethod('endDocking', function(exp) {
    var obj = this._obj;

    var endPoint = obj.waypoints[obj.waypoints.length - 1],
        endDocking = endPoint.original;
    var dockingAssert = new Assertion(endDocking);

    dockingAssert.assert(
      utils.eql(endDocking, exp),
      'expected <' + obj.id + '> to have end docking #{exp} but got #{act}',
      'expected <' + obj.id + '> to not have end docking #{exp}',
      exp,
      endDocking,
      true
    );
  });

};