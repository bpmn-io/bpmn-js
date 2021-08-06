import {
  pick
} from 'min-dash';

import {
  getDi
} from 'lib/util/ModelUtil';

var BOUNDS_ATTRS = [ 'x', 'y', 'width', 'height' ],
    POSITION_ATTRS = [ 'x', 'y' ],
    DIMENSION_ATTRS = [ 'width', 'height' ];

function getBounds(s) {

  if ('bounds' in s) {
    s = s.bounds;
  }

  // TLBR object
  if ('top' in s) {
    return {
      x: s.left,
      y: s.top,
      width: s.right - s.left,
      height: s.bottom - s.top
    };
  }

  // { x, y, width, height } object
  else {
    return pick(s, BOUNDS_ATTRS);
  }
}

function getDimensions(s) {
  return pick(getBounds(s), DIMENSION_ATTRS);
}

function getPosition(s) {
  return pick(getBounds(s), POSITION_ATTRS);
}


export default function(chai, utils) {

  var Assertion = chai.Assertion;

  function inspect(obj) {
    return utils.inspect(obj).replace(/\n /g, '');
  }


  /**
   * A simple bounds matcher, that verifies an element
   * has the correct { x, y, width, height }.
   *
   * @example
   *
   * expect(di.label).to.have.bounds({ x: 100, y: 100, width: 10, height: 20 });
   * expect(shape).to.have.bounds({ top: 100, left: 0, right: 200, bottom: 50 });
   *
   * @param {Bounds|TLBR} exp
   */
  Assertion.addMethod('bounds', function(exp) {
    var obj = this._obj;

    assertBounds(this, obj.id ? obj.id : obj, getBounds(obj), getBounds(exp));
  });


  /**
   * A simple bounds matcher, that verifies an element
   * has the correct { x, y, width, height }.
   *
   * @example
   *
   * expect(di.label).to.have.diBounds({ x: 100, y: 100, width: 10, height: 20 });
   * expect(shape).to.have.diBounds({ top: 100, left: 0, right: 200, bottom: 50 });
   *
   * @param {Bounds|TLBR} exp
   */
  Assertion.addMethod('diBounds', function(exp) {
    var obj = this._obj;

    var di = getDi(obj);

    expect(di).to.exist;

    assertBounds(this, di.id, getBounds(di), getBounds(exp));
  });

  /**
   * A simple dimensions matcher, that verifies an element
   * has the correct { width, height }.
   *
   * Unwraps `element.bounds` (BPMNDI) if present.
   *
   * @example
   *
   * expect(di.label).to.have.dimensions({ width: 10, height: 20 });
   *
   * @param {Dimensions} exp
   */
  Assertion.addMethod('dimensions', function(exp) {

    var obj = this._obj;

    assertDimensions(this, obj.id ? obj.id : obj, getDimensions(obj), getDimensions(exp));
  });


  /**
   * A simple dimensions matcher, that verifies an elements
   * DI has the correct { width, height }.
   *
   * Unwraps `element.bounds` (BPMNDI) if present.
   *
   * @example
   *
   * expect(di.label).to.have.diDimensions({ width: 10, height: 20 });
   *
   * @param {Dimensions} exp
   */
  Assertion.addMethod('diDimensions', function(exp) {

    var obj = this._obj;

    var di = getDi(obj);

    expect(di).to.exist;

    assertDimensions(this, di.id, getDimensions(di), getDimensions(exp));
  });


  /**
   * A simple position matcher, that verifies an element
   * has the correct { x, y }.
   *
   * Unwraps `element.bounds` (BPMNDI) if present.
   *
   * @example
   *
   * expect(taskShape).to.have.position({ x: 100, y: 150 });
   *
   * @param {Point} exp
   */
  Assertion.addMethod('position', function(exp) {

    var obj = this._obj;

    assertPosition(this, obj.id ? obj.id : obj, getPosition(obj), getPosition(exp));
  });


  /**
   * A simple position matcher, that verifies an element
   * has the correct DI position { x, y }.
   *
   * Unwraps `element.bounds` (BPMNDI) if present.
   *
   * @example
   *
   * expect(taskShape).to.have.diPosition({ x: 100, y: 150 });
   *
   * @param {Point} exp
   */
  Assertion.addMethod('diPosition', function(exp) {

    var obj = this._obj;

    var di = getDi(obj);

    expect(di).to.exist;

    assertPosition(this, di.id, getPosition(di), getPosition(exp));
  });


  // helpers ////////////////

  function assertBounds(self, desc, bounds, expectedBounds) {

    var matches = utils.eql(bounds, expectedBounds);

    var boundsStr = inspect(bounds),
        expectedBoundsStr = inspect(expectedBounds);

    var theAssert = new Assertion(bounds);

    // transfer flags
    utils.transferFlags(self, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + desc + '> bounds ' +
          'to equal \n  ' + expectedBoundsStr +
          '\nbut got\n  ' + boundsStr,
      'expected <' + desc + '> bounds ' +
          'not to equal \n  ' + expectedBoundsStr,
      expectedBounds
    );
  }

  function assertDimensions(self, desc, dimensions, expectedDimensions) {

    var matches = utils.eql(dimensions, expectedDimensions);

    var dimensionsStr = inspect(dimensions),
        expectedDimensionsStr = inspect(expectedDimensions);

    var theAssert = new Assertion(dimensions);

    // transfer flags
    utils.transferFlags(self, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + desc + '> dimensions ' +
          'to equal \n  ' + expectedDimensionsStr +
          '\nbut got\n  ' + dimensionsStr,
      'expected <' + desc + '> dimensions ' +
          'not to equal \n  ' + expectedDimensionsStr,
      expectedDimensions
    );
  }

  function assertPosition(self, desc, position, expectedPosition) {

    var matches = utils.eql(position, expectedPosition);

    var positionStr = inspect(position),
        expectedPositionStr = inspect(expectedPosition);


    var theAssert = new Assertion(position);

    // transfer flags
    utils.transferFlags(self, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + desc + '> position ' +
          'to equal \n  ' + expectedPositionStr +
          '\nbut got\n  ' + positionStr,
      'expected <' + desc + '> position ' +
          'not to equal \n  ' + expectedPositionStr,
      expectedPosition
    );
  }

}
