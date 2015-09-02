'use strict';

var pick = require('lodash/object/pick');


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


module.exports = function(chai, utils) {

  var Assertion = chai.Assertion;

  /**
   * A simple bounds matcher, that verifies an element
   * has the correct { x, y, width, height }.
   *
   * Unwraps `element.bounds` (BPMNDI) if present.
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

    BOUNDS_ATTRS.forEach(function(attr) {
      var bounds = new Assertion(objectBounds[attr]);

      bounds.assert(
        objectBounds[attr] == expectedBounds[attr],
        'expected <' + obj.id + '#' + attr + '> to equal #{exp} but got #{act}',
        'expected <' + obj.id + '#' + attr + '> to not equal #{exp}',
        expectedBounds[attr],
        objectBounds[attr]
      );
    });
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

    var objectBounds = getBounds(obj),
        expectedBounds = getBounds(exp);

    DIMENSION_ATTRS.forEach(function(attr) {
      var bounds = new Assertion(objectBounds[attr]);

      bounds.assert(
        objectBounds[attr] == expectedBounds[attr],
        'expected <' + obj.id + '#' + attr + '> to equal #{exp} but got #{act}',
        'expected <' + obj.id + '#' + attr + '> to not equal #{exp}',
        expectedBounds[attr],
        objectBounds[attr]
      );
    });
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

    var objectBounds = getBounds(obj),
        expectedBounds = getBounds(exp);

    POSITION_ATTRS.forEach(function(attr) {
      var bounds = new Assertion(objectBounds[attr]);

      bounds.assert(
        objectBounds[attr] == expectedBounds[attr],
        'expected <' + obj.id + '#' + attr + '> to equal #{exp} but got #{act}',
        'expected <' + obj.id + '#' + attr + '> to not equal #{exp}',
        expectedBounds[attr],
        objectBounds[attr]
      );
    });
  });

};