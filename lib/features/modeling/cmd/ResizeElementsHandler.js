import inherits from 'inherits-browser';

import BaseResizeElementsHandler from 'diagram-js/lib/features/modeling/cmd/ResizeElementsHandler';

import { isAny } from '../util/ModelingUtil';

/**
 * @typedef {import('../Modeling').default} Modeling
 *
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 */

/**
 * A handler that resizes multiple BPMN shapes,
 * resizing participants and lanes along with their lanes.
 *
 * @param {Modeling} modeling
 */
export default function ResizeElementsHandler(modeling) {
  BaseResizeElementsHandler.call(this, modeling);
}

inherits(ResizeElementsHandler, BaseResizeElementsHandler);

ResizeElementsHandler.$inject = [ 'modeling' ];

/**
 * @param {Shape} shape
 * @param {Rect} newBounds
 */
ResizeElementsHandler.prototype.resizeShape = function(shape, newBounds) {
  if (isAny(shape, [ 'bpmn:Lane', 'bpmn:Participant' ])) {
    return this._modeling.resizeLane(shape, newBounds);
  }

  BaseResizeElementsHandler.prototype.resizeShape.call(this, shape, newBounds);
};
