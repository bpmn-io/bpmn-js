import { forEach } from 'min-dash';
import { is } from './ModelUtil';

/**
 * @typedef { import('../model/Types').Element } Element
 */

/**
 * Get text annotations connected to the given element.
 *
 * @param {Element} element
 *
 * @return { { annotation: Element, association: Element }[] }
 */
export function getElementAnnotations(element) {
  let result = [];

  forEach(element.incoming, (connection) => {
    if (is(connection, 'bpmn:Association') && is(connection.source, 'bpmn:TextAnnotation')) {
      result.push({ annotation: connection.source, association: connection });
    }
  });

  forEach(element.outgoing, (connection) => {
    if (is(connection, 'bpmn:Association') && is(connection.target, 'bpmn:TextAnnotation')) {
      result.push({ annotation: connection.target, association: connection });
    }
  });

  return result;
}

/**
 * Recursively collect text annotations connected to the given elements and their descendants.
 *
 * @param {Element[]} elements
 *
 * @return { { annotation: Element, association: Element }[] }
 */
export function collectElementsAnnotations(elements) {
  const result = new Map();

  function collect(element) {
    forEach(getElementAnnotations(element), (entry) => {
      if (!result.has(entry.annotation)) {
        result.set(entry.annotation, entry);
      }
    });

    if (element.children) {
      forEach(element.children, collect);
    }
  }

  forEach(elements, collect);

  return [ ...result.values() ];
}
