import { DiagramElement, ModdleElement } from '../model';

/**
 * @param {DiagramElement} element
 * @param {ModdleElement} di
 *
 * @return {boolean}
 */
export function isExpanded(element: DiagramElement, di: ModdleElement): boolean;

/**
 * @param {DiagramElement} element
 *
 * @return {boolean}
 */
export function isInterrupting(element: DiagramElement): boolean;

/**
 * @param {DiagramElement} element
 *
 * @return {boolean}
 */
export function isEventSubProcess(element: DiagramElement): boolean;

/**
 * @param {DiagramElement} element
 * @param {string} eventType
 *
 * @return {boolean}
 */
export function hasEventDefinition(element: DiagramElement, eventType: string): boolean;

/**
 * @param {DiagramElement} element
 *
 * @return {boolean}
 */
export function hasErrorEventDefinition(element: DiagramElement): boolean;

/**
 * @param {DiagramElement} element
 *
 * @return {boolean}
 */
export function hasEscalationEventDefinition(element: DiagramElement): boolean;

/**
 * @param {DiagramElement} element
 *
 * @return {boolean}
 */
export function hasCompensateEventDefinition(element: DiagramElement): boolean;
