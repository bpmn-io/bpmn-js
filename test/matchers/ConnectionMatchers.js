import {
  pick
} from 'min-dash';

var POSITION_ATTRS = [ 'x', 'y' ];

function extractPoints(point) {
  return pick(point, POSITION_ATTRS);
}


export default function(chai, utils) {

  var Assertion = chai.Assertion;

  function inspect(obj) {
    return utils.inspect(obj).replace(/\n /g, '');
  }

  /**
   * A simple waypoints matcher, that verifies a connection
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

    var matches = utils.eql(strippedWaypoints, strippedExpectedWaypoints);

    var strippedWaypointsStr = inspect(strippedWaypoints),
        strippedExpectedWaypointsStr = inspect(strippedExpectedWaypoints);

    var theAssert = new Assertion(strippedWaypoints);

    // transfer negate status
    utils.transferFlags(this, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + obj.id + '#waypoints> ' +
          'to equal \n  ' + strippedExpectedWaypointsStr +
          '\nbut got\n  ' + strippedWaypointsStr,
      'expected <' + obj.id + '#waypoints> ' +
          'not to equal \n  ' + strippedExpectedWaypoints
    );
  });

  /**
   * A simple waypoints matcher, that verifies a connection
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
        startDocking = startPoint && startPoint.original;

    var matches = utils.eql(startDocking, exp);

    var startDockingStr = inspect(startDocking),
        expectedStartDockingStr = inspect(exp);

    var theAssert = new Assertion(startDocking);

    // transfer negate status
    utils.transferFlags(this, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + obj.id + '> to have startDocking ' +
        expectedStartDockingStr + ' but got ' + startDockingStr
    );
  });

  /**
   * A simple waypoints matcher, that verifies a connection
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
        endDocking = endPoint && endPoint.original;

    var matches = utils.eql(endDocking, exp);

    var endDockingStr = inspect(endDocking),
        expectedEndDockingStr = inspect(exp);

    var theAssert = new Assertion(endDocking);

    // transfer negate status
    utils.transferFlags(this, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + obj.id + '> to have endDocking ' +
        expectedEndDockingStr + ' but got ' + endDockingStr
    );
  });

}
