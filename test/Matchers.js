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

  var message = '';

  if (!pass) {
    message = 'Expected element#' + actual.id + ' with bbox ' +
                            jasmine.pp(pick(actualBBox, ['x', 'y', 'width', 'height'])) + ' to fit ' +
                            jasmine.pp(expected);
  }

  return !!pass;
}


module.exports = { toFitBBox: toFitBBox };
