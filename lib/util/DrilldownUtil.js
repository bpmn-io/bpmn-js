import { getDi, is } from './ModelUtil';

/**
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

export var planeSuffix = '_plane';

/**
 * Get primary shape ID for a plane.
 *
 * @param  {Element|ModdleElement} element
 *
 * @return {string}
 */
export function getShapeIdFromPlane(element) {
  var id = element.id;

  return removePlaneSuffix(id);
}

/**
 * Get plane ID for a primary shape.
 *
 * @param  {Element|ModdleElement} element
 *
 * @return {string}
 */
export function getPlaneIdFromShape(element) {
  var id = element.id;

  if (is(element, 'bpmn:SubProcess')) {
    return addPlaneSuffix(id);
  }

  return id;
}

/**
 * Get plane ID for primary shape ID.
 *
 * @param {string} id
 *
 * @return {string}
 */
export function toPlaneId(id) {
  return addPlaneSuffix(id);
}

/**
 * Check wether element is plane.
 *
 * @param  {Element|ModdleElement} element
 *
 * @return {boolean}
 */
export function isPlane(element) {
  var di = getDi(element);

  return is(di, 'bpmndi:BPMNPlane');
}

function addPlaneSuffix(id) {
  return id + planeSuffix;
}

function removePlaneSuffix(id) {
  return id.replace(new RegExp(planeSuffix + '$'), '');
}