'use strict';

var svgTransform = require('tiny-svg/lib/transform');

var createTransform = require('tiny-svg/lib/geometry').createTransform;


/**
 * @param {<SVGElement>} element
 * @param {Number} x
 * @param {Number} y
 * @param {Number} angle
 * @param {Number} amount
 */
module.exports.transform = function(gfx, x, y, angle, amount) {
  var translate = createTransform();
  translate.setTranslate(x, y);

  var rotate = createTransform();
  rotate.setRotate(angle, 0, 0);

  var scale = createTransform();
  scale.setScale(amount || 1, amount || 1);

  svgTransform(gfx, [ translate, rotate, scale ]);
};


/**
 * @param {SVGElement} element
 * @param {Number} x
 * @param {Number} y
 */
module.exports.translate = function(gfx, x, y) {
  // var translate = createTransform();
  // translate.setTranslate(x, y);
  //
  // svgTransform(gfx, translate);

  // TODO@philippfromme: temporary fix for Chrome >57
  gfx.setAttribute('transform', matrixToTransformString({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: x,
    f: y
  }));
};


/**
 * @param {SVGElement} element
 * @param {Number} angle
 */
module.exports.rotate = function(gfx, angle) {
  var rotate = createTransform();
  rotate.setRotate(angle, 0, 0);

  svgTransform(gfx, rotate);
};


/**
 * @param {SVGElement} element
 * @param {Number} amount
 */
module.exports.scale = function(gfx, amount) {
  var scale = createTransform();
  scale.setScale(amount, amount);

  svgTransform(gfx, scale);
};

// TODO@philippfromme: temporary fix for Chrome >57
function matrixToTransformString(matrix) {
  return 'matrix(' + [
    matrix.a || 1,
    matrix.b || 0,
    matrix.c || 0,
    matrix.d || 1,
    matrix.e || 0,
    matrix.f || 0
  ] + ')';
}
