import { isString } from 'min-dash';

export { is, isAny } from '../../../util/ModelUtil';

import { isAny } from '../../../util/ModelUtil';

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