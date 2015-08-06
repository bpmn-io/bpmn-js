'use strict';

var getOrientation = require('diagram-js/lib/layout/LayoutUtil').getOrientation;


module.exports.getBoundaryAttachment = function(position, targetBounds) {

  var orientation = getOrientation(position, targetBounds, -15);

  if (orientation !== 'intersect') {
    return orientation;
  } else {
    return null;
  }
};