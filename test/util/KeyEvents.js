import {
  isString,
  assign
} from 'min-dash';

/**
 * Create a fake key event for testing purposes.
 *
 * @param {string|number} key the key or keyCode/charCode
 * @param {Object} [attrs]
 *
 * @return {Event}
 */
export function createKeyEvent(key, attrs) {
  var event = document.createEvent('Events') || new document.defaultView.CustomEvent('keyEvent');

  // init and mark as bubbles / cancelable
  event.initEvent('keydown', false, true);

  var keyAttrs = isString(key) ? { key: key } : { keyCode: key, which: key };

  return assign(event, keyAttrs, attrs || {});
}