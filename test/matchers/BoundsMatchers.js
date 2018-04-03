import {
  pick
} from 'min-dash';

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

    var objectBounds = getBounds(obj),
        expectedBounds = getBounds(exp);

    var matches = utils.eql(objectBounds, expectedBounds);

    var objectBoundsStr = inspect(objectBounds),
        expectedBoundsStr = inspect(expectedBounds);


    var theAssert = new Assertion(objectBounds);

    // transfer flags
    utils.transferFlags(this, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + (obj.id ? '#' + obj.id : obj) + '> bounds ' +
          'to equal \n  ' + expectedBoundsStr +
          '\nbut got\n  ' + objectBoundsStr,
      'expected <' + (obj.id ? '#' + obj.id : obj) + '> bounds ' +
          'not to equal \n  ' + expectedBoundsStr
    );
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

    var objectDimensions = getDimensions(obj),
        expectedDimensions = getDimensions(exp);

    var matches = utils.eql(objectDimensions, expectedDimensions);

    var objectDimensionsStr = inspect(objectDimensions),
        expectedDimensionsStr = inspect(expectedDimensions);


    var theAssert = new Assertion(objectDimensions);

    // transfer flags
    utils.transferFlags(this, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + (obj.id ? '#' + obj.id : obj) + '> dimensions ' +
          'to equal \n  ' + expectedDimensionsStr +
          '\nbut got\n  ' + objectDimensionsStr,
      'expected <' + (obj.id ? '#' + obj.id : obj) + '> dimensions ' +
          'not to equal \n  ' + expectedDimensionsStr
    );
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

    var objectPosition = getPosition(obj),
        expectedPosition = getPosition(exp);

    var matches = utils.eql(objectPosition, expectedPosition);

    var objectPositionStr = inspect(objectPosition),
        expectedPositionStr = inspect(expectedPosition);


    var theAssert = new Assertion(objectPosition);

    // transfer flags
    utils.transferFlags(this, theAssert, false);

    theAssert.assert(
      matches,
      'expected <' + (obj.id ? '#' + obj.id : obj) + '> position ' +
          'to equal \n  ' + expectedPositionStr +
          '\nbut got\n  ' + objectPositionStr,
      'expected <' + (obj.id ? '#' + obj.id : obj) + '> position ' +
          'not to equal \n  ' + expectedPositionStr
    );
  });

}
