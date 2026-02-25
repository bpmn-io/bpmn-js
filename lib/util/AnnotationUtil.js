import { forEach } from 'min-dash';
import { selfAndChildren } from 'diagram-js/lib/util/Elements';
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
 * De-duplicates by annotation, collecting all associations per annotation.
 *
 * @param {Element[]} elements
 *
 * @return { { annotation: Element, associations: Element[] }[] }
 */
export function collectElementsAnnotations(elements) {
  const result = new Map();

  forEach(selfAndChildren(elements, true, -1), (element) => {
    forEach(getElementAnnotations(element), (entry) => {
      if (!result.has(entry.annotation)) {
        result.set(entry.annotation, { annotation: entry.annotation, associations: [] });
      }
      result.get(entry.annotation).associations.push(entry.association);
    });
  });

  return [ ...result.values() ];
}
