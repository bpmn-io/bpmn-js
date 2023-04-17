import {
  pick
} from 'min-dash';

import {
  getDi
} from 'lib/util/ModelUtil';

var POSITION_ATTRS = [ 'x', 'y' ];

function getPoint(point) {
  return pick(point, POSITION_ATTRS);
}

function getPoints(waypoints) {
  return waypoints.map(getPoint);
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

    expect(obj).to.have.property('waypoints');

    assertWaypoints(this, obj.id + '#waypoints', getPoints(obj.waypoints), getPoints(exp));
  });


  /**
   * A simple waypoints matcher, that verifies a connection
   * consists of the correct DI waypoints.
   *
   * Does not take the original docking into account.
   *
   * @example
   *
   * expect(connection).to.have.diWaypoints([ { x: 100, y: 100 }, { x: 0, y: 0 } ]);
   *
   * @param {Connection|Point[]} exp
   */
  Assertion.addMethod('diWaypoints', function(exp) {
    var obj = this._obj;

    var di = getDi(obj);

    expect(di).to.exist;

    expect(di).to.have.property('waypoint');

    assertWaypoints(this, di + '#waypoint', getPoints(di.waypoint), getPoints(exp));
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


  // helpers ////////////////

  function assertWaypoints(self, desc, waypoints, expectedWaypoints) {

    var matches = utils.eql(waypoints, expectedWaypoints);

    var waypointsStr = inspect(waypoints),
        expectedWaypointsStr = inspect(expectedWaypoints);

    var theAssert = new Assertion(waypoints);

    // transfer negate status
    utils.transferFlags(self, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + desc + '> ' +
          'to equal \n  ' + expectedWaypointsStr +
          '\nbut got\n  ' + waypointsStr,
      'expected <' + desc + '> ' +
          'not to equal \n  ' + expectedWaypoints,
      expectedWaypoints
    );
  }

}