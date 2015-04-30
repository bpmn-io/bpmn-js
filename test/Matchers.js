'use strict';

var pick = require('lodash/object/pick');

function toFitBBox(actual, expected) {

  var actualBBox = actual.getBBox();

  var pass = actualBBox.x >= expected.x &&
             actualBBox.y >= expected.y &&
             actualBBox.width <= expected.width &&
             actualBBox.x + actualBBox.width <= expected.x + expected.width &&
             (expected.height ? actualBBox.height <= expected.height : true) &&
             (expected.height ? actualBBox.y + actualBBox.height <= expected.y + expected.height : true);


  if (!pass) {
    var bbox = pick(actualBBox, ['x', 'y', 'width', 'height']);

    var message =
      'Expected Element#' + actual.id + ' with bbox ' +
       JSON.stringify(bbox) + ' to fit ' +
       JSON.stringify(expected);

    console.error(message);
  }

  return !!pass;
}


module.exports = { toFitBBox: toFitBBox };
