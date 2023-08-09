import {
  has
} from 'min-dash';

/**
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */


// TODO(nikku): remove with future bpmn-js version

var DI_ERROR_MESSAGE = 'Tried to access di from the businessObject. The di is available through the diagram element only. For more information, see https://github.com/bpmn-io/bpmn-js/issues/1472';

/**
 * @private
 *
 * @param {ModdleElement} businessObject
 */
export function ensureCompatDiRef(businessObject) {

  // bpmnElement can have multiple independent DIs
  if (!has(businessObject, 'di')) {
    Object.defineProperty(businessObject, 'di', {
      enumerable: false,
      get: function() {
        throw new Error(DI_ERROR_MESSAGE);
      }
    });
  }
}