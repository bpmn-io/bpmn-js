import { is } from '../../../util/ModelUtil';

import {
  getParent
} from './ModelingUtil';

import {
  asTRBL
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  substractTRBL,
  resizeTRBL
} from 'diagram-js/lib/features/resize/ResizeUtil';

/**
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 */

var abs = Math.abs;


function getTRBLResize(oldBounds, newBounds) {
  return substractTRBL(asTRBL(newBounds), asTRBL(oldBounds));
}


var LANE_PARENTS = [
  'bpmn:Participant',
  'bpmn:Process',
  'bpmn:SubProcess'
];

export var LANE_INDENTATION = 30;


/**
 * Return all lanes that are children of the given shape.
 *
 * @param  {Shape} shape
 * @param  {Shape[]} [collectedShapes]
 *
 * @return {Shape[]}
 */
export function collectLanes(shape, collectedShapes) {

  collectedShapes = collectedShapes || [];

  shape.children.filter(function(s) {
    if (is(s, 'bpmn:Lane')) {
      collectLanes(s, collectedShapes);

      collectedShapes.push(s);
    }
  });

  return collectedShapes;
}


/**
 * Return all lanes that are direct children of the given shape.
 *
 * @param {Shape} shape
 *
 * @return {Shape[]}
 */
export function getChildLanes(shape) {
  return shape.children.filter(function(c) {
    return is(c, 'bpmn:Lane');
  });
}


/**
 * Return the parent shape of the given lane.
 *
 * @param {Shape} shape
 *
 * @return {Shape}
 */
export function getLanesRoot(shape) {
  return getParent(shape, LANE_PARENTS) || shape;
}


/**
 * Compute the required resize operations for lanes
 * adjacent to the given shape, assuming it will be
 * resized to the given new bounds.
 *
 * @param {Shape} shape
 * @param {Rect} newBounds
 *
 * @return { {
 *   shape: Shape;
 *   newBounds: Rect;
 * }[] }
 */
export function computeLanesResize(shape, newBounds) {

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