import inherits from 'inherits-browser';

import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';

import { is } from '../../util/ModelUtil';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../model/Types').BpmnShape} BpmnShape
 *
 * @typedef {import('diagram-js/lib/util/Types').Axis} Axis
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 */

/**
 * @param {Injector} injector
 */
export default function BpmnSpaceTool(injector) {
  injector.invoke(SpaceTool, this);
}

BpmnSpaceTool.$inject = [
  'injector'
];

inherits(BpmnSpaceTool, SpaceTool);

/**
 * @param {BpmnShape[]} elements
 * @param {Axis} axis
 * @param {Point} delta
 * @param {number} start
 *
 * @returns {Object}
 */
BpmnSpaceTool.prototype.calculateAdjustments = function(elements, axis, delta, start) {
  var adjustments = SpaceTool.prototype.calculateAdjustments.call(this, elements, axis, delta, start);

  // do not resize text annotations
  adjustments.resizingShapes = adjustments.resizingShapes.filter(function(shape) {
    return !is(shape, 'bpmn:TextAnnotation');
  });

  return adjustments;
};