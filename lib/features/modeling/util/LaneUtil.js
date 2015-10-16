'use strict';

var is = require('../../../util/ModelUtil').is;

var getParent = require('./ModelingUtil').getParent;

var asTRBL = require('diagram-js/lib/layout/LayoutUtil').asTRBL,
    substractTRBL = require('diagram-js/lib/features/resize/ResizeUtil').substractTRBL,
    resizeTRBL = require('diagram-js/lib/features/resize/ResizeUtil').resizeTRBL;

var abs = Math.abs;


function getTRBLResize(oldBounds, newBounds) {
  return substractTRBL(asTRBL(newBounds), asTRBL(oldBounds));
}


var LANE_PARENTS = [
  'bpmn:Participant',
  'bpmn:Process',
  'bpmn:SubProcess'
];

var LANE_INDENTATION = 30;

module.exports.LANE_INDENTATION = LANE_INDENTATION;


/**
 * Collect all lane shapes in the given paren
 *
 * @param  {djs.model.Shape} shape
 * @param  {Array<djs.model.Base>} [collectedShapes]
 *
 * @return {Array<djs.model.Base>}
 */
function collectLanes(shape, collectedShapes) {

  collectedShapes = collectedShapes || [];

  shape.children.filter(function(s) {
    if (is(s, 'bpmn:Lane')) {
      collectLanes(s, collectedShapes);

      collectedShapes.push(s);
    }
  });

  return collectedShapes;
}

module.exports.collectLanes = collectLanes;

/**
 * Return the lane children of the given element.
 *
 * @param {djs.model.Shape} shape
 *
 * @return {Array<djs.model.Shape>}
 */
function getChildLanes(shape) {
  return shape.children.filter(function(c) {
    return is(c, 'bpmn:Lane');
  });
}

module.exports.getChildLanes = getChildLanes;

/**
 * Return the root element containing the given lane shape
 *
 * @param {djs.model.Shape} shape
 *
 * @return {djs.model.Shape}
 */
function getLanesRoot(shape) {
  return getParent(shape, LANE_PARENTS) || shape;
}

module.exports.getLanesRoot = getLanesRoot;


/**
 * Compute the required resize operations for lanes
 * adjacent to the given shape, assuming it will be
 * resized to the given new bounds.
 *
 * @param {djs.model.Shape} shape
 * @param {Bounds} newBounds
 *
 * @return {Array<Object>}
 */
function computeLanesResize(shape, newBounds) {

  var rootElement = getLanesRoot(shape);

  var initialShapes = is(rootElement, 'bpmn:Process') ? [] : [ rootElement ];

  var allLanes = collectLanes(rootElement, initialShapes),
      shapeTrbl = asTRBL(shape),
      shapeNewTrbl = asTRBL(newBounds),
      trblResize = getTRBLResize(shape, newBounds),
      resizeNeeded = [];

  allLanes.forEach(function(other) {

    if (other === shape) {
      return;
    }

    var topResize = 0,
        rightResize = trblResize.right,
        bottomResize = 0,
        leftResize = trblResize.left;

    var otherTrbl = asTRBL(other);

    if (trblResize.top) {
      if (abs(otherTrbl.bottom - shapeTrbl.top) < 10) {
        bottomResize = shapeNewTrbl.top - otherTrbl.bottom;
      }

      if (abs(otherTrbl.top - shapeTrbl.top) < 5) {
        topResize = shapeNewTrbl.top - otherTrbl.top;
      }
    }

    if (trblResize.bottom) {
      if (abs(otherTrbl.top - shapeTrbl.bottom) < 10) {
        topResize = shapeNewTrbl.bottom - otherTrbl.top;
      }

      if (abs(otherTrbl.bottom - shapeTrbl.bottom) < 5) {
        bottomResize = shapeNewTrbl.bottom - otherTrbl.bottom;
      }
    }

    if (topResize || rightResize || bottomResize || leftResize) {

      resizeNeeded.push({
        shape: other,
        newBounds: resizeTRBL(other, {
          top: topResize,
          right: rightResize,
          bottom: bottomResize,
          left: leftResize
        })
      });
    }

  });

  return resizeNeeded;
}

module.exports.computeLanesResize = computeLanesResize;
