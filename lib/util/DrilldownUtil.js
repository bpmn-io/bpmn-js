import { getDi, is } from './ModelUtil';


export var planePostfix = '_plane';

/**
 * Returns the ID of the plane associated with an element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @returns {String} id of the associated plane
 */
export function planeId(element) {
  if (is(element, 'bpmn:SubProcess')) {
    return element.id + planePostfix;
  }

  return element.id;
}

/**
 * Returns returns the plane ID for a given ID, as if it was associated with a
 * subprocess.
 *
 * @param {String} shape ID
 * @returns
 */
export function asPlaneId(string) {
  return string + planePostfix;
}

/**
 * Returns wether the given element is a plane.
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @returns {Boolean}
 */
export function isPlane(element) {
  var di = getDi(element);
  return is(di, 'bpmndi:BPMNPlane');
}

/**
 * Returns the ID of the primary Shape for a plane.
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @returns {String}
 */
export function primaryShape(element) {
  return element.id.replace(planePostfix, '');
}