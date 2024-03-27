import { is } from '../../util/ModelUtil';

import {
  isAny,
  isDirectionHorizontal
} from '../modeling/util/ModelingUtil';

import {
  getMid,
  asTRBL,
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  findFreePosition,
  generateGetNextPosition,
  getConnectedDistance
} from 'diagram-js/lib/features/auto-place/AutoPlaceUtil';

import { isConnection } from 'diagram-js/lib/util/ModelUtil';

/**
 * @typedef {import('../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 */

/**
 * Get the position for given new target relative to the source it will be
 * connected to.
 *
 * @param  {Shape} source
 * @param  {Shape} element
 *
 * @return {Point}
 */
export function getNewShapePosition(source, element) {

  if (is(element, 'bpmn:TextAnnotation')) {
    return getTextAnnotationPosition(source, element);
  }

  if (isAny(element, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])) {
    return getDataElementPosition(source, element);
  }

  if (is(element, 'bpmn:FlowNode')) {
    return getFlowNodePosition(source, element);
  }
}

/**
 * Get the position for given new flow node. Try placing the flow node right/bottom of
 * the source.
 *
 * @param {Shape} source
 * @param {Shape} element
 *
 * @return {Point}
 */
export function getFlowNodePosition(source, element) {

  var sourceTrbl = asTRBL(source);
  var sourceMid = getMid(source);

  var placeHorizontally = isDirectionHorizontal(source);

  var placement = placeHorizontally ? {
    directionHint: 'e',
    minDistance: 80,
    baseOrientation: 'left',
    boundaryOrientation: 'top',
    start: 'top',
    end: 'bottom'
  } : {
    directionHint: 's',
    minDistance: 90,
    baseOrientation: 'top',
    boundaryOrientation: 'left',
    start: 'left',
    end: 'right'
  };

  var connectedDistance = getConnectedDistance(source, {
    filter: function(connection) {
      return is(connection, 'bpmn:SequenceFlow');
    },
    direction: placement.directionHint
  });

  var margin = 30,
      minDistance = placement.minDistance,
      orientation = placement.baseOrientation;

  if (is(source, 'bpmn:BoundaryEvent')) {
    orientation = getOrientation(source, source.host, -25);

    if (orientation.indexOf(placement.boundaryOrientation) !== -1) {
      margin *= -1;
    }
  }

  var position = placeHorizontally ? {
    x: sourceTrbl.right + connectedDistance + element.width / 2,
    y: sourceMid.y + getDistance(orientation, minDistance, placement)
  } : {
    x: sourceMid.x + getDistance(orientation, minDistance, placement),
    y: sourceTrbl.bottom + connectedDistance + element.height / 2
  };

  var nextPosition = {
    margin: margin,
    minDistance: minDistance
  };

  var nextPositionDirection = placeHorizontally ? {
    y: nextPosition
  } : {
    x: nextPosition
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}

/**
 * @param {DirectionTRBL} orientation
 * @param {number} minDistance
 * @param {{ start: DirectionTRBL, end: DirectionTRBL }} placement
 *
 * @return {number}
 */
function getDistance(orientation, minDistance, placement) {
  if (orientation.includes(placement.start)) {
    return -1 * minDistance;
  } else if (orientation.includes(placement.end)) {
    return minDistance;
  } else {
    return 0;
  }
}


/**
 * Get the position for given text annotation. Try placing the text annotation
 * top-right of the source (bottom-right in vertical layouts).
 *
 * @param {Shape} source
 * @param {Shape} element
 *
 * @return {Point}
 */
export function getTextAnnotationPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var placeHorizontally = isDirectionHorizontal(source);

  var position = placeHorizontally ? {
    x: sourceTrbl.right + element.width / 2,
    y: sourceTrbl.top - 50 - element.height / 2
  } : {
    x: sourceTrbl.right + 50 + element.width / 2,
    y: sourceTrbl.bottom + element.height / 2
  };

  if (isConnection(source)) {
    position = getMid(source);
    if (placeHorizontally) {
      position.x += 100;
      position.y -= 50;
    } else {
      position.x += 100;
      position.y += 50;
    }
  }

  var nextPosition = {
    margin: placeHorizontally ? -30 : 30,
    minDistance: 20
  };
  var nextPositionDirection = placeHorizontally ? {
    y: nextPosition
  } : {
    x: nextPosition
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}


/**
 * Get the position for given new data element. Try placing the data element
 * bottom-right of the source (bottom-left in vertical layouts).
 *
 * @param {Shape} source
 * @param {Shape} element
 *
 * @return {Point}
 */
export function getDataElementPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var placeHorizontally = isDirectionHorizontal(source);

  var position = placeHorizontally ? {
    x: sourceTrbl.right - 10 + element.width / 2,
    y: sourceTrbl.bottom + 40 + element.width / 2
  } : {
    x: sourceTrbl.left - 40 - element.width / 2,
    y: sourceTrbl.bottom - 10 + element.height / 2
  };

  var nextPosition = {
    margin: 30,
    minDistance: 30
  };
  var nextPositionDirection = placeHorizontally ? {
    x: nextPosition
  } : {
    y: nextPosition
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}