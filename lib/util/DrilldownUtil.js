import { getDi, is } from './ModelUtil';


export var planeSuffix = '_plane';

/**
 * Get primary shape ID for a plane.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @returns {String}
 */
export function getShapeIdFromPlane(element) {
  var id = element.id;

  return removePlaneSuffix(id);
}

/**
 * Get plane ID for a primary shape.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @returns {String}
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
 * @param {String} id
 *
 * @returns {String}
 */
export function toPlaneId(id) {
  return addPlaneSuffix(id);
}

/**
 * Check wether element is plane.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @returns {Boolean}
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