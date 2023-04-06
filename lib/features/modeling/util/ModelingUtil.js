import { isString } from 'min-dash';

export { is, isAny } from '../../../util/ModelUtil';

import { isAny } from '../../../util/ModelUtil';

/**
 * @typedef {import('../../../model/Types').BpmnElement} BpmnElement
 */

/**
 * Return the parent of the element with any of the given types.
 *
 * @param {BpmnElement} element
 * @param {string|string[]} anyType
 *
 * @return {BpmnElement|null}
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