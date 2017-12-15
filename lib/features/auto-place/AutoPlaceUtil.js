'use strict';

var is = require('../../util/ModelUtil').is;

var getMid = require('diagram-js/lib/layout/LayoutUtil').getMid,
    asTRBL = require('diagram-js/lib/layout/LayoutUtil').asTRBL,
    getOrientation = require('diagram-js/lib/layout/LayoutUtil').getOrientation;

var find = require('lodash/collection/find'),
    reduce = require('lodash/collection/reduce'),
    filter = require('lodash/collection/filter');

var DEFAULT_HORIZONTAL_DISTANCE = 50;

var MAX_HORIZONTAL_DISTANCE = 250;

// padding to detect element placement
var PLACEMENT_DETECTION_PAD = 10;


/**
 * Always try to place element right of source;
 * compute actual distance from previous nodes in flow.
 */
function getFlowNodePosition(source, element) {

  var sourceTrbl = asTRBL(source);
  var sourceMid = getMid(source);

  var horizontalDistance = getFlowNodeDistance(source, element);

  var position = {
    x: sourceTrbl.right + horizontalDistance + element.width / 2,
    y: sourceMid.y
  };

  var escapeDirection = {
    y: {
      margin: 30,
      rowSize: 80
    }
  };

  return deconflictPosition(source, element, position, escapeDirection);
}

module.exports.getFlowNodePosition = getFlowNodePosition;


/**
 * Compute best distance between source and target,
 * based on existing connections to and from source.
 *
 * @param {djs.model.Shape} source
 * @param {djs.model.Shape} element
 *
 * @return {Number} distance
 */
function getFlowNodeDistance(source, element) {

  var sourceTrbl = asTRBL(source);

  // is connection a reference to consider?
  var isReference = function(c) {
    return is(c, 'bpmn:SequenceFlow');
  };

  // we create a list of nodes to take into consideration
  // for calculating the optimal flow node distance
  //
  //   * weight existing target nodes higher than source nodes
  //   * only take into account individual nodes once
  //
  var nodes = reduce([].concat(
    filter(source.outgoing, isReference).map(function(c) {
      return {
        shape: c.target,
        weight: 5,
        distanceTo: function(shape) {
          var shapeTrbl = asTRBL(shape);

          return shapeTrbl.left - sourceTrbl.right;
        }
      };
    }),
    filter(source.incoming, isReference).map(function(c) {
      return {
        shape: c.source,
        weight: 1,
        distanceTo: function(shape) {
          var shapeTrbl = asTRBL(shape);

          return sourceTrbl.left - shapeTrbl.right;
        }
      };
    })
  ), function(nodes, node) {
    // filter out shapes connected twice via source or target
    nodes[node.shape.id + '__weight_' + node.weight] = node;

    return nodes;
  }, {});

  // compute distances between source and incoming nodes;
  // group at the same time by distance and expose the
  // favourite distance as { fav: { count, value } }.
  var distancesGrouped = reduce(nodes, function(result, node) {

    var shape = node.shape,
        weight = node.weight,
        distanceTo = node.distanceTo;

    var fav = result.fav,
        currentDistance,
        currentDistanceCount,
        currentDistanceEntry;

    currentDistance = distanceTo(shape);

    // ignore too far away peers
    // or non-left to right modeled nodes
    if (currentDistance < 0 || currentDistance > MAX_HORIZONTAL_DISTANCE) {
      return result;
    }

    currentDistanceEntry = result[String(currentDistance)] =
      result[String(currentDistance)] || {
        value: currentDistance,
        count: 0
      };

    // inc diff count
    currentDistanceCount = currentDistanceEntry.count += 1 * weight;

    if (!fav || fav.count < currentDistanceCount) {
      result.fav = currentDistanceEntry;
    }

    return result;
  }, { });


  if (distancesGrouped.fav) {
    return distancesGrouped.fav.value;
  } else {
    return DEFAULT_HORIZONTAL_DISTANCE;
  }
}

module.exports.getFlowNodeDistance = getFlowNodeDistance;


/**
 * Always try to place text annotations top right of source.
 */
function getTextAnnotationPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var position = {
    x: sourceTrbl.right + element.width / 2,
    y: sourceTrbl.top - 50 - element.height / 2
  };

  var escapeDirection = {
    y: {
      margin: -30,
      rowSize: 20
    }
  };

  return deconflictPosition(source, element, position, escapeDirection);
}

module.exports.getTextAnnotationPosition = getTextAnnotationPosition;


/**
 * Always put element bottom right of source.
 */
function getDataElementPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var position = {
    x: sourceTrbl.right - 10 + element.width / 2,
    y: sourceTrbl.bottom + 40 + element.width / 2
  };

  var escapeDirection = {
    x: {
      margin: 30,
      rowSize: 30
    }
  };

  return deconflictPosition(source, element, position, escapeDirection);
}

module.exports.getDataElementPosition = getDataElementPosition;


/**
 * Always put element right of source per default.
 */
function getDefaultPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var sourceMid = getMid(source);

  // simply put element right next to source
  return {
    x: sourceTrbl.right + DEFAULT_HORIZONTAL_DISTANCE + element.width / 2,
    y: sourceMid.y
  };
}

module.exports.getDefaultPosition = getDefaultPosition;


/**
 * Return target at given position, if defined.
 */
function getConnectedAtPosition(source, position, element) {

  var bounds = {
    x: position.x - (element.width / 2),
    y: position.y - (element.height / 2),
    width: element.width,
    height: element.height
  };

  var targets = source.outgoing.map(function(c) {
    return c.target;
  });

  var sources = source.incoming.map(function(c) {
    return c.source;
  });

  var allConnected = [].concat(targets, sources);

  return find(allConnected, function(target) {
    var orientation = getOrientation(target, bounds, PLACEMENT_DETECTION_PAD);

    return orientation === 'intersect';
  });
}

module.exports.getConnectedAtPosition = getConnectedAtPosition;


/**
 * Returns a new, position for the given element
 * based on the given element that is not occupied
 * by any element connected to source.
 *
 * Take into account the escapeDirection (where to move
 * on positining clashes) in the computation.
 *
 * @param {djs.model.Shape} source
 * @param {djs.model.Shape} element
 * @param {Point} position
 * @param {Object} escapeDelta
 *
 * @return {Point}
 */
function deconflictPosition(source, element, position, escapeDelta) {

  function nextPosition(existingElement) {

    var newPosition = {
      x: position.x,
      y: position.y
    };

    [ 'x', 'y' ].forEach(function(axis) {

      var axisDelta = escapeDelta[axis];

      if (!axisDelta) {
        return;
      }

      var dimension = axis === 'x' ? 'width' : 'height';

      var margin = axisDelta.margin,
          rowSize = axisDelta.rowSize;

      if (margin < 0) {
        newPosition[axis] = Math.min(
          existingElement[axis] + margin - element[dimension] / 2,
          position[axis] - rowSize + margin
        );
      } else {
        newPosition[axis] = Math.max(
          existingTarget[axis] + existingTarget[dimension] + margin + element[dimension] / 2,
          position[axis] + rowSize + margin
        );
      }
    });

    return newPosition;
  }

  var existingTarget;


  // deconflict position until free slot is found
  while ((existingTarget = getConnectedAtPosition(source, position, element))) {
    position = nextPosition(existingTarget);
  }

  return position;
}

module.exports.deconflictPosition = deconflictPosition;