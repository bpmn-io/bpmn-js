'use strict';

var sortBy = require('lodash/collection/sortBy'),
    forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

var AXIS_DIMENSIONS = {
  horizontal: [ 'x', 'width' ],
  vertical: [ 'y', 'height' ]
};

var THRESHOLD = 5;

/**
 * Groups and filters elements and then trigger even distribution.
 */
function DistributeElements(modeling) {
  this._modeling = modeling;

  this._filters = [];

  // register filter for filtering big elements
  this.registerFilter(function(elements, axis, dimension) {
    var elementsSize = 0,
        numOfShapes = 0,
        avgDimension;

    forEach(elements, function(element) {
      if (element.waypoints || element.labelTarget) {
        return;
      }

      elementsSize += element[dimension];

      numOfShapes += 1;
    });

    avgDimension = Math.round(elementsSize / numOfShapes);

    return filter(elements, function(element) {
      return element[dimension] < (avgDimension + 50);
    });
  });

}

module.exports = DistributeElements;

DistributeElements.$inject = [ 'modeling' ];


/**
 * Registers filter functions that allow external parties to filter
 * out certain elements.
 *
 * @param  {Function} filterFn
 */
DistributeElements.prototype.registerFilter = function(filterFn) {
  if (typeof filterFn !== 'function') {
    throw new Error('the filter has to be a function');
  }

  this._filters.push(filterFn);
};

/**
 * Distributes the elements with a given orientation
 *
 * @param  {Array} elements    [description]
 * @param  {String} orientation [description]
 */
DistributeElements.prototype.trigger = function(elements, orientation) {
  var modeling = this._modeling;

  var groups,
      distributableElements;

  if (elements.length < 3) {
    return;
  }

  this._setOrientation(orientation);

  distributableElements = this._filterElements(elements);

  groups = this._createGroups(distributableElements);

  // nothing to distribute
  if (groups.length <= 2) {
    return;
  }

  modeling.distributeElements(groups, this._axis, this._dimension);

  return groups;
};

/**
 * Filters the elements with provided filters by external parties
 *
 * @param  {Array[Elements]} elements
 *
 * @return {Array[Elements]}
 */
DistributeElements.prototype._filterElements = function(elements) {
  var filters = this._filters,
      axis = this._axis,
      dimension = this._dimension,
      distributableElements = [].concat(elements);

  if (!filters.length) {
    return elements;
  }

  forEach(filters, function(filterFn) {
    distributableElements = filterFn(distributableElements, axis, dimension);
  });

  return distributableElements;
};


/**
 * Create range (min, max) groups. Also tries to group elements
 * together that share the same range.
 *
 * @example
 * 	var distributableElements = [
 * 		{
 * 			range: {
 * 				min: 100,
 * 				max: 200
 * 			},
 * 			elements: [ { id: 'shape1', .. }]
 * 		}
 * 	]
 *
 * @param  {Array} elements
 *
 * @return {Array[Objects]}
 */
DistributeElements.prototype._createGroups = function(elements) {
  var rangeGroups = [],
      axis = this._axis,
      dimension = this._dimension;

  if (!axis) {
    throw new Error('must have a defined "axis" and "dimension"');
  }

  // sort by 'left->right' or 'top->bottom'
  var sortedElements = sortBy(elements, axis);

  forEach(sortedElements, function(element, idx) {
    var elementRange = this._findRange(element, axis, dimension),
        range;

    var previous = rangeGroups[rangeGroups.length - 1];

    if (previous && this._hasIntersection(previous.range, elementRange)) {
      rangeGroups[rangeGroups.length - 1].elements.push(element);
    } else {
      range = { range: elementRange, elements: [ element ] };

      rangeGroups.push(range);
    }
  }, this);

  return rangeGroups;
};


/**
 * Maps a direction to the according axis and dimension
 *
 * @param  {String} direction 'horizontal' or 'vertical'
 */
DistributeElements.prototype._setOrientation = function(direction) {
  var orientation = AXIS_DIMENSIONS[direction];

  this._axis = orientation[0];
  this._dimension = orientation[1];
};


/**
 * Checks if the two ranges intercept each other
 *
 * @param  {Object} rangeA {min, max}
 * @param  {Object} rangeB {min, max}
 *
 * @return {Boolean}
 */
DistributeElements.prototype._hasIntersection = function(rangeA, rangeB) {
  return Math.max(rangeA.min, rangeA.max) >= Math.min(rangeB.min, rangeB.max) &&
         Math.min(rangeA.min, rangeA.max) <= Math.max(rangeB.min, rangeB.max);
};


/**
 * Returns the min and max values for an element
 *
 * @param  {[type]} element   [description]
 * @param  {[type]} axis      [description]
 * @param  {[type]} dimension [description]
 *
 * @return {[type]}           [description]
 */
DistributeElements.prototype._findRange = function(element) {
  var axis = element[this._axis],
      dimension = element[this._dimension];

  return {
    min: axis + THRESHOLD,
    max: axis + dimension - THRESHOLD
  };
};
