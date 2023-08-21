import AutoResize from 'diagram-js/lib/features/auto-resize/AutoResize';

import inherits from 'inherits-browser';

import { is } from '../../util/ModelUtil';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 */

/**
 * BPMN-specific resize behavior.
 *
 * @param {Injector} injector
 */
export default function BpmnAutoResize(injector) {

  injector.invoke(AutoResize, this);
}

BpmnAutoResize.$inject = [
  'injector'
];

inherits(BpmnAutoResize, AutoResize);

/**
 * Perform BPMN-specific resizing of participants.
 *
 * @param {Shape} target
 * @param {Rect} newBounds
 * @param {Object} [hints]
 * @param {string} [hints.autoResize]
 */
BpmnAutoResize.prototype.resize = function(target, newBounds, hints) {

  if (is(target, 'bpmn:Participant')) {
    this._modeling.resizeLane(target, newBounds, null, hints);
  } else {
    this._modeling.resizeShape(target, newBounds, null, hints);
  }
};