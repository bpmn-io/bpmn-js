import {
  ModdleElement,
  DiagramElement
} from '../model';


/**
 * Is an element of the given BPMN type?
 *
 * @param {DiagramElement|ModdleElement} element
 * @param {string} type
 *
 * @return {boolean}
 */
export function is(element: DiagramElement | ModdleElement, type: string): boolean;

/**
 * Return true if element has any of the given types.
 *
 * @param {DiagramElement} element
 * @param {Array<string>} types
 *
 * @return {boolean}
 */
export function isAny(element: DiagramElement, types: Array<string>): boolean;

/**
 * Return the business object for a given element.
 *
 * @param {DiagramElement|ModdleElement} element
 *
 * @return {ModdleElement}
 */
export function getBusinessObject(element: DiagramElement | ModdleElement): ModdleElement;

/**
 * Return the di object for a given element.
 *
 * @param {DiagramElement} element
 *
 * @return {ModdleElement}
 */
export function getDi(element: DiagramElement): ModdleElement;
