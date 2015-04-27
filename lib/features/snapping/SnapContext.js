'use strict';

var forEach = require('lodash/collection/forEach');

var snapTo = require('./SnapUtil').snapTo;


/**
 * A snap context, containing the (possibly incomplete)
 * mappings of drop targets (to identify the snapping)
 * to computed snap points.
 */
function SnapContext() {

  /**
   * Map<String, SnapPoints> mapping drop targets to
   * a list of possible snappings.
   *
   * @type {Object}
   */
  this._targets = {};

  /**
   * Map<String, Point> initial positioning of element
   * regarding various snap directions.
   *
   * @type {Object}
   */
  this._snapOrigins = {};

  /**
   * List of snap locations
   *
   * @type {Array<String>}
   */
  this._snapLocations = [];

  /**
   * Map<String, Array<Point>> of default snapping locations
   *
   * @type {Object}
   */
  this._defaultSnaps = {};
}


SnapContext.prototype.getSnapOrigin = function(snapLocation) {
  return this._snapOrigins[snapLocation];
};


SnapContext.prototype.setSnapOrigin = function(snapLocation, initialValue) {
  this._snapOrigins[snapLocation] = initialValue;

  if (this._snapLocations.indexOf(snapLocation) === -1) {
    this._snapLocations.push(snapLocation);
  }
};


SnapContext.prototype.addDefaultSnap = function(type, point) {

  var snapValues = this._defaultSnaps[type];

  if (!snapValues) {
    snapValues = this._defaultSnaps[type] = [];
  }

  snapValues.push(point);
};

/**
 * Return a number of initialized snaps, i.e. snap locations such as
 * top-left, mid, bottom-right and so forth.
 *
 * @return {Array<String>} snapLocations
 */
SnapContext.prototype.getSnapLocations = function() {
  return this._snapLocations;
};

/**
 * Set the snap locations for this context.
 *
 * The order of locations determines precedence.
 *
 * @param {Array<String>} snapLocations
 */
SnapContext.prototype.setSnapLocations = function(snapLocations) {
  this._snapLocations = snapLocations;
};

/**
 * Get snap points for a given target
 *
 * @param {Element|String} target
 */
SnapContext.prototype.pointsForTarget = function(target) {

  var targetId = target.id || target;

  var snapPoints = this._targets[targetId];

  if (!snapPoints) {
    snapPoints = this._targets[targetId] = new SnapPoints();
    snapPoints.initDefaults(this._defaultSnaps);
  }

  return snapPoints;
};

module.exports = SnapContext;


/**
 * Creates the snap points and initializes them with the
 * given default values.
 *
 * @param {Object<String, Array<Point>>} [defaultPoints]
 */
function SnapPoints(defaultSnaps) {

  /**
   * Map<String, Map<(x|y), Array<Number>>> mapping snap locations,
   * i.e. top-left, bottom-right, center to actual snap values.
   *
   * @type {Object}
   */
  this._snapValues = {};
}

SnapPoints.prototype.add = function(snapLocation, point) {

  var snapValues = this._snapValues[snapLocation];

  if (!snapValues) {
    snapValues = this._snapValues[snapLocation] = { x: [], y: [] };
  }

  if (snapValues.x.indexOf(point.x) === -1) {
    snapValues.x.push(point.x);
  }

  if (snapValues.y.indexOf(point.y) === -1) {
    snapValues.y.push(point.y);
  }
};


SnapPoints.prototype.snap = function(point, snapLocation, axis, tolerance) {
  var snappingValues = this._snapValues[snapLocation];
  
  return snappingValues && snapTo(point[axis], snappingValues[axis], tolerance);
};

/**
 * Initialize a number of default snapping points.
 *
 * @param  {Object} defaultSnaps
 */
SnapPoints.prototype.initDefaults = function(defaultSnaps) {

  var self = this;

  forEach(defaultSnaps || {}, function(snapPoints, snapLocation) {
    forEach(snapPoints, function(point) {
      self.add(snapLocation, point);
    });
  });
};