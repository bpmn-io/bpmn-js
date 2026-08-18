import {
  getBusinessObject,
  getDi,
  is
} from './ModelUtil';

import {
  isExpanded
} from './DiUtil';

/**
 * @typedef {import('diagram-js/lib/util/Types').Dimensions} Dimensions
 *
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

/**
 * Default size of elements without an explicit default.
 *
 * @type {Dimensions}
 */
export const DEFAULT_SIZE = { width: 100, height: 80 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_TASK_SIZE = { width: 100, height: 80 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_GATEWAY_SIZE = { width: 50, height: 50 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_EVENT_SIZE = { width: 36, height: 36 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_SUB_PROCESS_SIZE = { width: 350, height: 200 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_COLLAPSED_SUB_PROCESS_SIZE = { width: 100, height: 80 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_PARTICIPANT_SIZE = { width: 600, height: 250 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_VERTICAL_PARTICIPANT_SIZE = { width: 250, height: 600 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_COLLAPSED_PARTICIPANT_SIZE = { width: 400, height: 60 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_VERTICAL_COLLAPSED_PARTICIPANT_SIZE = { width: 60, height: 400 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_LANE_SIZE = { width: 400, height: 100 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_DATA_OBJECT_REFERENCE_SIZE = { width: 36, height: 50 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_DATA_STORE_REFERENCE_SIZE = { width: 50, height: 50 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_TEXT_ANNOTATION_SIZE = { width: 100, height: 40 };

/**
 * @type {Dimensions}
 */
export const DEFAULT_GROUP_SIZE = { width: 300, height: 300 };


/**
 * Get the default size of a BPMN element.
 *
 * Elements without an explicit default, e.g. `bpmn:CallActivity`, fall back to
 * `DEFAULT_SIZE`.
 *
 * @param {Element|ModdleElement} element The element.
 * @param {ModdleElement} [di] The DI; defaults to the DI of the element.
 *
 * @return {Dimensions} Default width and height of the element.
 */
export function getDefaultSize(element, di) {

  const bo = getBusinessObject(element);

  di = di || getDi(element);

  if (is(bo, 'bpmn:SubProcess')) {
    if (isExpanded(bo, di)) {
      return { ...DEFAULT_SUB_PROCESS_SIZE };
    } else {
      return { ...DEFAULT_COLLAPSED_SUB_PROCESS_SIZE };
    }
  }

  if (is(bo, 'bpmn:Task')) {
    return { ...DEFAULT_TASK_SIZE };
  }

  if (is(bo, 'bpmn:Gateway')) {
    return { ...DEFAULT_GATEWAY_SIZE };
  }

  if (is(bo, 'bpmn:Event')) {
    return { ...DEFAULT_EVENT_SIZE };
  }

  if (is(bo, 'bpmn:Participant')) {
    const isHorizontalPool = !di || di.isHorizontal === undefined || di.isHorizontal === true;

    if (isExpanded(bo, di)) {
      if (isHorizontalPool) {
        return { ...DEFAULT_PARTICIPANT_SIZE };
      }

      return { ...DEFAULT_VERTICAL_PARTICIPANT_SIZE };
    } else {
      if (isHorizontalPool) {
        return { ...DEFAULT_COLLAPSED_PARTICIPANT_SIZE };
      }

      return { ...DEFAULT_VERTICAL_COLLAPSED_PARTICIPANT_SIZE };
    }
  }

  if (is(bo, 'bpmn:Lane')) {
    return { ...DEFAULT_LANE_SIZE };
  }

  if (is(bo, 'bpmn:DataObjectReference')) {
    return { ...DEFAULT_DATA_OBJECT_REFERENCE_SIZE };
  }

  if (is(bo, 'bpmn:DataStoreReference')) {
    return { ...DEFAULT_DATA_STORE_REFERENCE_SIZE };
  }

  if (is(bo, 'bpmn:TextAnnotation')) {
    return { ...DEFAULT_TEXT_ANNOTATION_SIZE };
  }

  if (is(bo, 'bpmn:Group')) {
    return { ...DEFAULT_GROUP_SIZE };
  }

  return { ...DEFAULT_SIZE };
}
