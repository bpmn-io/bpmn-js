import {
  forEach,
  isArray,
  isObject,
  isString
} from 'min-dash';

export { is, isAny } from '../../../util/ModelUtil';

import {
  is,
  isAny,
  getBusinessObject
} from '../../../util/ModelUtil';

import { isHorizontal } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 * @typedef {import('../../../model/Types').Moddle} Moddle
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
 * @param {ElementRegistry} [elementRegistry] - provide to consider parent diagram direction
 *
 * @return {boolean} false for vertical pools, lanes and their children. true otherwise
 */
export function isDirectionHorizontal(element, elementRegistry) {

  var parent = getParent(element, 'bpmn:Process');
  if (parent) {
    return true;
  }

  var types = [ 'bpmn:Participant', 'bpmn:Lane' ];

  parent = getParent(element, types);
  if (parent) {
    return isHorizontal(parent);
  } else if (isAny(element, types)) {
    return isHorizontal(element);
  }

  var process;
  for (process = getBusinessObject(element); process; process = process.$parent) {
    if (is(process, 'bpmn:Process')) {
      break;
    }
  }

  if (!elementRegistry) {
    return true;
  }

  // The direction may be specified in another diagram. We ignore that there
  // could be multiple diagrams with contradicting properties based on the
  // assumption that such BPMN files are unusual.
  var pool = elementRegistry.find(function(shape) {
    var businessObject = getBusinessObject(shape);
    return businessObject && businessObject.get('processRef') === process;
  });

  if (!pool) {
    return true;
  }

  return isHorizontal(pool);
}

/**
 * Set the given moddle element as `$parent` of the moddle elements
 * contained in the given properties, unless they already have a parent.
 *
 * Referenced elements are left untouched.
 *
 * @param {ModdleElement} parent
 * @param {Record<string, any>} properties
 * @param {Moddle} moddle
 *
 * @return {ModdleElement[]} elements the parent got set on
 */
export function setContainedElementsParent(parent, properties, moddle) {
  var updated = [];

  forEach(properties, function(value, name) {
    var descriptor = moddle.getPropertyDescriptor(parent, name);

    if (!descriptor || descriptor.isReference) {
      return;
    }

    forEach(isArray(value) ? value : [ value ], function(child) {
      if (isObject(child) && child.$type && !child.$parent) {
        child.$parent = parent;

        updated.push(child);
      }
    });
  });

  return updated;
}

/**
 * Unset `$parent` of the given moddle elements.
 *
 * @param {ModdleElement[]} elements
 */
export function unsetParent(elements) {
  forEach(elements, function(element) {
    element.$parent = undefined;
  });
}
