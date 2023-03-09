import { DiagramElement } from '../../model';

/**
 * @param {DiagramElement} element
 *
 * @return {string} label
 */
export function getLabel(element: DiagramElement): string;

/**
 * @param {DiagramElement} element
 * @param {string} text
 *
 * @return {DiagramElement} element
 */
export function setLabel(element: DiagramElement, text: string): DiagramElement;
