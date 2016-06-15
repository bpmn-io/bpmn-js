'use strict';

var forEach = require('lodash/collection/forEach');

/**
 * A handler that align elements in a certain way.
 *
 */
function AlignElements(modeling, canvas) {
  this._modeling = modeling;
  this._canvas = canvas;
}

AlignElements.$inject = [ 'modeling', 'canvas' ];

module.exports = AlignElements;


AlignElements.prototype.preExecute = function(context) {
  var modeling = this._modeling;

  var elements = context.elements,
      alignment = context.alignment;


  forEach(elements, function(element) {
    var delta = {
      x: 0,
      y: 0
    };

    if (alignment.left) {
      delta.x = alignment.left - element.x;

    } else if (alignment.right) {
      delta.x = (alignment.right - element.width) - element.x;

    } else if (alignment.center) {
      delta.x = (alignment.center - Math.round(element.width / 2)) - element.x;

    } else if (alignment.top) {
      delta.y = alignment.top - element.y;

    } else if (alignment.bottom) {
      delta.y = (alignment.bottom - element.height) - element.y;

    } else if (alignment.middle) {
      delta.y = (alignment.middle - Math.round(element.height / 2)) - element.y;
    }

    modeling.moveElements([ element ], delta, element.parent);
  });
};

AlignElements.prototype.postExecute = function(context) {

};
