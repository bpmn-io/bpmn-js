'use strict';

/**
 * @param {<SVGElement>} element
 * @param {Number} x
 * @param {Number} y
 * @param {Number} angle
 * @param {Number} amount
 */
module.exports.transform = function(gfx, x, y, angle, amount) {
  var transform = '';

  if (x !== 0 || y !== 0) {
    transform += 'translate(' + x + ' ' + y + ') ';
  }

  if (angle !== 0) {
    transform += 'rotate(' + angle + ') ';
  }

  if (amount) {
    transform += 'scale(' + amount + ' ' + amount + ')';
  }

  transform = transform.trim();

  gfx.setAttribute('transform', transform);
};


/**
 * @param {SVGElement} element
 * @param {Number} x
 * @param {Number} y
 */
module.exports.translate = function(gfx, x, y) {
  gfx.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
};


/**
 * @param {SVGElement} element
 * @param {Number} angle
 */
module.exports.rotate = function(gfx, angle) {
  gfx.setAttribute('transform', 'rotate(' + angle + ')');
};


/**
 * @param {SVGElement} element
 * @param {Number} amount
 */
module.exports.scale = function(gfx, amount) {
  gfx.setAttribute('transform', 'scale(' + amount + ' ' + amount + ')');
};
