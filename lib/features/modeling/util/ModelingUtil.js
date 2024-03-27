import { isString } from 'min-dash';

export { is, isAny } from '../../../util/ModelUtil';

import { isAny } from '../../../util/ModelUtil';

import { isHorizontal } from '../../../util/DiUtil';

/**
 * @typedef {import('../../../model/Types').Element} Element
 */

/**
 * Return the parent of the element with any of the given types.
 *
 * @param {Element} element
 * @param {string|string[]} anyType
 *
 * @return {Element|null}
 */
export function getParent(element, anyType) {

  if (isString(anyType)) {
    anyType = [ anyType ];
  }

  while ((element = element.parent)) {
    if (isAny(element, anyType)) {
      return element;
    }
  }

  return null;
}

/**
 * Determines if the local modeling direction is vertical or horizontal.
 *
 * @param {Element} element
 *
 * @return {boolean} false for vertical pools, lanes and their children. true otherwise
 */
export function isDirectionHorizontal(element) {

  var types = [ 'bpmn:Participant', 'bpmn:Lane' ];

  var parent = getParent(element, types);
  if (parent) {
    return isHorizontal(parent);
  } else if (isAny(element, types)) {
    return isHorizontal(element);
  }

  return true;
}