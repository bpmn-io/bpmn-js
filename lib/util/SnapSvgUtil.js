'use strict';

var Snap = require('../../vendor/snapsvg');

module.exports.wrapSnapSvg = function(element) {
  return Snap._.wrap(element);
};

/* Try unwrapping snapsvg element */
module.exports.unwrapSnapSvg = function(element) {
  return element.node ? element.node : element;
};
