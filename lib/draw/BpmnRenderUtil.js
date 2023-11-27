import {
  has,
  some
} from 'min-dash';

import {
  getDi
} from '../util/ModelUtil';

import {
  componentsToPath
} from 'diagram-js/lib/util/RenderUtil';


/**
 * @typedef {import('../model').ModdleElement} ModdleElement
 * @typedef {import('../model').Element} Element
 *
 * @typedef {import('../model').ShapeLike} ShapeLike
 *
 * @typedef {import('diagram-js/lib/util/Types').Dimensions} Dimensions
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 */

// re-export for compatibility
export {
  getDi,
  getBusinessObject as getSemantic
} from '../util/ModelUtil';


export var black = 'hsl(225, 10%, 15%)';
export var white = 'white';

// element utils //////////////////////

/**
 * Checks if eventDefinition of the given element matches with semantic type.
 *
 * @param {ModdleElement} event
 * @param {string} eventDefinitionType
 *
 * @return {boolean}
 */
export function isTypedEvent(event, eventDefinitionType) {
  return some(event.eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
}

/**
 * Check if element is a throw event.
 *
 * @param {ModdleElement} event
 *
 * @return {boolean}
 */
export function isThrowEvent(event) {
  return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
}

/**
 * Check if element is a throw event.
 *
 * @param {ModdleElement} element
 *
 * @return {boolean}
 */
export function isCollection(element) {
  var dataObject = element.dataObjectRef;

  return element.isCollection || (dataObject && dataObject.isCollection);
}


// color access //////////////////////

/**
 * @param {Element} element
 * @param {string} [defaultColor]
 * @param {string} [overrideColor]
 *
 * @return {string}
 */
export function getFillColor(element, defaultColor, overrideColor) {
  var di = getDi(element);

  return overrideColor || di.get('color:background-color') || di.get('bioc:fill') || defaultColor || white;
}

/**
 * @param {Element} element
 * @param {string} [defaultColor]
 * @param {string} [overrideColor]
 *
 * @return {string}
 */
export function getStrokeColor(element, defaultColor, overrideColor) {
  var di = getDi(element);

  return overrideColor || di.get('color:border-color') || di.get('bioc:stroke') || defaultColor || black;
}

/**
 * @param {Element} element
 * @param {string} [defaultColor]
 * @param {string} [defaultStrokeColor]
 * @param {string} [overrideColor]
 *
 * @return {string}
 */
export function getLabelColor(element, defaultColor, defaultStrokeColor, overrideColor) {
  var di = getDi(element),
      label = di.get('label');

  return overrideColor || (label && label.get('color:color')) || defaultColor ||
    getStrokeColor(element, defaultStrokeColor);
}

// cropping path customizations //////////////////////

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getCirclePath(shape) {

  var cx = shape.x + shape.width / 2,
      cy = shape.y + shape.height / 2,
      radius = shape.width / 2;

  var circlePath = [
    [ 'M', cx, cy ],
    [ 'm', 0, -radius ],
    [ 'a', radius, radius, 0, 1, 1, 0, 2 * radius ],
    [ 'a', radius, radius, 0, 1, 1, 0, -2 * radius ],
    [ 'z' ]
  ];

  return componentsToPath(circlePath);
}

/**
 * @param {ShapeLike} shape
 * @param {number} [borderRadius]
 *
 * @return {string} path
 */
export function getRoundRectPath(shape, borderRadius) {

  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var roundRectPath = [
    [ 'M', x + borderRadius, y ],
    [ 'l', width - borderRadius * 2, 0 ],
    [ 'a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius ],
    [ 'l', 0, height - borderRadius * 2 ],
    [ 'a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius ],
    [ 'l', borderRadius * 2 - width, 0 ],
    [ 'a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius ],
    [ 'l', 0, borderRadius * 2 - height ],
    [ 'a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius ],
    [ 'z' ]
  ];

  return componentsToPath(roundRectPath);
}

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getDiamondPath(shape) {

  var width = shape.width,
      height = shape.height,
      x = shape.x,
      y = shape.y,
      halfWidth = width / 2,
      halfHeight = height / 2;

  var diamondPath = [
    [ 'M', x + halfWidth, y ],
    [ 'l', halfWidth, halfHeight ],
    [ 'l', -halfWidth, halfHeight ],
    [ 'l', -halfWidth, -halfHeight ],
    [ 'z' ]
  ];

  return componentsToPath(diamondPath);
}

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getRectPath(shape) {
  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var rectPath = [
    [ 'M', x, y ],
    [ 'l', width, 0 ],
    [ 'l', 0, height ],
    [ 'l', -width, 0 ],
    [ 'z' ]
  ];

  return componentsToPath(rectPath);
}

/**
 * Get width and height from element or overrides.
 *
 * @param {Dimensions|Rect|ShapeLike} bounds
 * @param {Object} overrides
 *
 * @returns {Dimensions}
 */
export function getBounds(bounds, overrides = {}) {
  return {
    width: getWidth(bounds, overrides),
    height: getHeight(bounds, overrides)
  };
}

/**
 * Get width from element or overrides.
 *
 * @param {Dimensions|Rect|ShapeLike} bounds
 * @param {Object} overrides
 *
 * @returns {number}
 */
export function getWidth(bounds, overrides = {}) {
  return has(overrides, 'width') ? overrides.width : bounds.width;
}

/**
 * Get height from element or overrides.
 *
 * @param {Dimensions|Rect|ShapeLike} bounds
 * @param {Object} overrides
 *
 * @returns {number}
 */
export function getHeight(bounds, overrides = {}) {
  return has(overrides, 'height') ? overrides.height : bounds.height;
}