'use strict';

var svgTransform = require('tiny-svg/lib/transform');

var createTransform = require('tiny-svg/lib/geometry').createTransform;


/**
 * @param {<SVGElement>} element
 * @param {Number} x
 * @param {Number} y
 * @param {Number} angle
 */
module.exports.transform = function(gfx, x, y, angle) {
  var rotate = createTransform();
  rotate.setRotate(angle, 0, 0);

  var translate = createTransform();
  translate.setTranslate(x, y);

  svgTransform(gfx, [ translate, rotate ]);
};


/**
 * @param {<SVGElement>} element
 * @param {Number} x
 * @param {Number} y
 */
module.exports.translate = function(gfx, x, y) {
  var translate = createTransform();
  translate.setTranslate(x, y);

  svgTransform(gfx, translate);
};


/**
 * @param {<SVGElement>} element
 * @param {Number} angle
 */
module.exports.rotate = function(gfx, angle) {
  var rotate = createTransform();
  rotate.setRotate(angle, 0, 0);

  svgTransform(gfx, rotate);
};
