import { is } from '../../util/ModelUtil';
import { isAny } from '../modeling/util/ModelingUtil';

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
 * Get the position for given new flow node. Try placing the flow node right of
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

  var horizontalDistance = getConnectedDistance(source, {
    filter: function(connection) {
      return is(connection, 'bpmn:SequenceFlow');
    }
  });

  var margin = 30,
      minDistance = 80,
      orientation = 'left';

  if (is(source, 'bpmn:BoundaryEvent')) {
    orientation = getOrientation(source, source.host, -25);

    if (orientation.indexOf('top') !== -1) {
      margin *= -1;
    }
  }

  var position = {
    x: sourceTrbl.right + horizontalDistance + element.width / 2,
    y: sourceMid.y + getVerticalDistance(orientation, minDistance)
  };

  var nextPositionDirection = {
    y: {
      margin: margin,
      minDistance: minDistance
    }
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}

/**
 * @param {DirectionTRBL} orientation
 * @param {number} minDistance
 *
 * @return {number}
 */
function getVerticalDistance(orientation, minDistance) {
  if (orientation.includes('top')) {
    return -1 * minDistance;
  } else if (orientation.includes('bottom')) {
    return minDistance;
  } else {
    return 0;
  }
}


/**
 * Get the position for given text annotation. Try placing the text annotation
 * top-right of the source.
 *
 * @param {Shape} source
 * @param {Shape} element
 *
 * @return {Point}
 */
export function getTextAnnotationPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var position = {
    x: sourceTrbl.right + element.width / 2,
    y: sourceTrbl.top - 50 - element.height / 2
  };

  if (isConnection(source)) {
    position = getMid(source);
    position.x += 100;
    position.y -= 50;
  }

  var nextPositionDirection = {
    y: {
      margin: -30,
      minDistance: 20
    }
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}


/**
 * Get the position for given new data element. Try placing the data element
 * bottom-right of the source.
 *
 * @param {Shape} source
 * @param {Shape} element
 *
 * @return {Point}
 */
export function getDataElementPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var position = {
    x: sourceTrbl.right - 10 + element.width / 2,
    y: sourceTrbl.bottom + 40 + element.width / 2
  };

  var nextPositionDirection = {
    x: {
      margin: 30,
      minDistance: 30
    }
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}