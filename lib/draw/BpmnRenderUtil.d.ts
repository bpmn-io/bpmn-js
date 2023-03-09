import { ModdleElement, DiagramElement } from '../model';

/**
 * Checks if eventDefinition of the given element matches with semantic type.
 *
 * @param {ModdleElement} event
 * @param {string} eventDefinitionType
 *
 * @return {boolean}
 */
export function isTypedEvent(event: ModdleElement, eventDefinitionType: string): boolean;

/**
 * Check if element is a throw event.
 *
 * @param {ModdleElement} event
 *
 * @return {boolean}
 */
export function isThrowEvent(event: ModdleElement): boolean;

/**
 * Check if element is a throw event.
 *
 * @param {ModdleElement} event
 *
 * @return {boolean}
 */
export function isCollection(element: any): boolean;

/**
 * @param {DiagramElement} element
 * @param {string} defaultColor
 *
 * @return {string}
 */
export function getFillColor(element: DiagramElement, defaultColor: string): string;

/**
 * @param {DiagramElement} element
 * @param {string} defaultColor
 *
 * @return {string}
 */
export function getStrokeColor(element: DiagramElement, defaultColor: string): string;

/**
 * @param {DiagramElement} element
 * @param {string} defaultColor
 * @param {string} defaultStrokeColor
 *
 * @return {string}
 */
export function getLabelColor(element: DiagramElement, defaultColor: string, defaultStrokeColor: string): string;

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getCirclePath(shape: ShapeLike): string;

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getRoundRectPath(shape: ShapeLike, borderRadius: any): string;

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getDiamondPath(shape: ShapeLike): string;

/**
 * @param {ShapeLike} shape
 *
 * @return {string} path
 */
export function getRectPath(shape: ShapeLike): string;

export const black: string;

export { getDi } from "../util/ModelUtil";
export { getBusinessObject as getSemantic } from "../util/ModelUtil";
