'use strict';

var filter = require('lodash/collection/filter');

var max = Math.max,
    min = Math.min;

var DEFAULT_CHILD_BOX_PADDING = 20;

var getBBox = require('../../util/Elements').getBBox;


var asTRBL = require('../../layout/LayoutUtil').asTRBL,
    asBounds = require('../../layout/LayoutUtil').asBounds;

function isNumber(a) {
  return typeof a === 'number';
}

/**
 * Substract a TRBL from another
 *
 * @param  {TRBL} trblA
 * @param  {TRBL} trblB
 *
 * @return {TRBL}
 */
module.exports.substractTRBL = function(trblA, trblB) {
  return {
    top: trblA.top - trblB.top,
    right: trblA.right - trblB.right,
    bottom: trblA.bottom - trblB.bottom,
    left: trblA.left - trblB.left
  };
};

/**
 * Resize the given bounds by the specified delta from a given anchor point.
 *
 * @param {Bounds} bounds the bounding box that should be resized
 * @param {String} direction in which the element is resized (nw, ne, se, sw)
 * @param {Point} delta of the resize operation
 *
 * @return {Bounds} resized bounding box
 */
module.exports.resizeBounds = function(bounds, direction, delta) {

  var dx = delta.x,
      dy = delta.y;

  switch (direction) {

    case 'nw':
      return {
        x: bounds.x + dx,
        y: bounds.y + dy,
        width: bounds.width - dx,
        height: bounds.height - dy
      };

    case 'sw':
      return {
        x: bounds.x + dx,
        y: bounds.y,
        width: bounds.width - dx,
        height: bounds.height + dy
      };

    case 'ne':
      return {
        x: bounds.x,
        y: bounds.y + dy,
        width: bounds.width + dx,
        height: bounds.height - dy
      };

    case 'se':
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width + dx,
        height: bounds.height + dy
      };

    default:
      throw new Error('unrecognized direction: ' + direction);
  }
};


/**
 * Resize the given bounds by applying the passed
 * { top, right, bottom, left } delta.
 *
 * @param {Bounds} bounds
 * @param {TRBL} trblResize
 *
 * @return {Bounds}
 */
module.exports.resizeTRBL = function(bounds, resize) {
  return {
    x: bounds.x + (resize.left || 0),
    y: bounds.y + (resize.top || 0),
    width: bounds.width - (resize.left || 0) + (resize.right || 0),
    height: bounds.height - (resize.top || 0) + (resize.bottom || 0)
  };
};


module.exports.reattachPoint = function(bounds, newBounds, point) {

  var sx = bounds.width / newBounds.width,
      sy = bounds.height / newBounds.height;

  return {
    x: Math.round((newBounds.x + newBounds.width / 2)) - Math.floor(((bounds.x + bounds.width / 2) - point.x) / sx),
    y: Math.round((newBounds.y + newBounds.height / 2)) - Math.floor(((bounds.y + bounds.height / 2) - point.y) / sy)
  };
};


function applyConstraints(attr, trbl, resizeConstraints) {

  var value = trbl[attr],
      minValue = resizeConstraints.min && resizeConstraints.min[attr],
      maxValue = resizeConstraints.max && resizeConstraints.max[attr];

  if (isNumber(minValue)) {
    value = (/top|left/.test(attr) ? min : max)(value, minValue);
  }

  if (isNumber(maxValue)) {
    value = (/top|left/.test(attr) ? max : min)(value, maxValue);
  }

  return value;
}

module.exports.ensureConstraints = function(currentBounds, resizeConstraints) {

  if (!resizeConstraints) {
    return currentBounds;
  }

  var currentTrbl = asTRBL(currentBounds);

  return asBounds({
    top: applyConstraints('top', currentTrbl, resizeConstraints),
    right: applyConstraints('right', currentTrbl, resizeConstraints),
    bottom: applyConstraints('bottom', currentTrbl, resizeConstraints),
    left: applyConstraints('left', currentTrbl, resizeConstraints)
  });
};


module.exports.getMinResizeBounds = function(direction, currentBounds, minDimensions, childrenBounds) {

  var currentBox = asTRBL(currentBounds);

  var minBox = {
    top: /n/.test(direction) ? currentBox.bottom - minDimensions.height : currentBox.top,
    left: /w/.test(direction) ? currentBox.right - minDimensions.width : currentBox.left,
    bottom: /s/.test(direction) ? currentBox.top + minDimensions.height : currentBox.bottom,
    right: /e/.test(direction) ? currentBox.left + minDimensions.width : currentBox.right
  };

  var childrenBox = childrenBounds ? asTRBL(childrenBounds) : minBox;

  var combinedBox = {
    top: min(minBox.top, childrenBox.top),
    left: min(minBox.left, childrenBox.left),
    bottom: max(minBox.bottom, childrenBox.bottom),
    right: max(minBox.right, childrenBox.right),
  };

  return asBounds(combinedBox);
};

function asPadding(mayBePadding, defaultValue) {
  if (typeof mayBePadding !== 'undefined') {
    return mayBePadding;
  } else {
    return DEFAULT_CHILD_BOX_PADDING;
  }
}

function addPadding(bbox, padding) {
  var left, right, top, bottom;

  if (typeof padding === 'object') {
    left = asPadding(padding.left);
    right = asPadding(padding.right);
    top = asPadding(padding.top);
    bottom = asPadding(padding.bottom);
  } else {
    left = right = top = bottom = asPadding(padding);
  }

  return {
    x: bbox.x - left,
    y: bbox.y - top,
    width: bbox.width + left + right,
    height: bbox.height + top + bottom
  };
}

module.exports.addPadding = addPadding;


/**
 * Is the given element part of the resize
 * targets min boundary box?
 *
 * This is the default implementation which excludes
 * connections and labels.
 *
 * @param {djs.model.Base} element
 */
function isBBoxChild(element) {

  // exclude connections
  if (element.waypoints) {
    return false;
  }

  // exclude labels
  if (element.type === 'label') {
    return false;
  }

  return true;
}

/**
 * Return children bounding computed from a shapes children
 * or a list of prefiltered children.
 *
 * @param  {djs.model.Shape|Array<djs.model.Shape>} shapeOrChildren
 * @param  {Number|Object} padding
 *
 * @return {Bounds}
 */
function computeChildrenBBox(shapeOrChildren, padding) {

  var elements;

  // compute based on shape
  if (shapeOrChildren.length === undefined) {
    // grab all the children that are part of the
    // parents children box
    elements = filter(shapeOrChildren.children, isBBoxChild);

  } else {
    elements = shapeOrChildren;
  }

  if (elements.length) {
    return addPadding(getBBox(elements), padding);
  }
}

module.exports.computeChildrenBBox = computeChildrenBBox;
