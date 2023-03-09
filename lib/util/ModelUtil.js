import {
  some
} from 'min-dash';


/**
 * @typedef { import('../model').DiagramElement } DiagramElement
 */

/**
 * Is an element of the given BPMN type?
 *
 * @param  {DiagramElement|ModdleElement} element
 * @param  {string} type
 *
 * @return {boolean}
 */
export function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}


/**
 * Return true if element has any of the given types.
 *
 * @param {DiagramElement} element
 * @param {Array<string>} types
 *
 * @return {boolean}
 */
export function isAny(element, types) {
  return some(types, function(t) {
    return is(element, t);
  });
}

/**
 * Return the business object for a given element.
 *
 * @param {DiagramElement|ModdleElement} element
 *
 * @return {ModdleElement}
 */
export function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

/**
 * Return the di object for a given element.
 *
 * @param {DiagramElement} element
 *
 * @return {ModdleElement}
 */
export function getDi(element) {
  return element && element.di;
}