import inherits from 'inherits-browser';

import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';

import { getEnclosedElements, getBBox } from 'diagram-js/lib/util/Elements';

import { getBusinessObject, is } from '../../util/ModelUtil';

import { isHorizontal } from '../../util/DiUtil';
import { values } from 'min-dash';

/**
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 *
 * @typedef {import('../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').Axis} Axis
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 */

/**
 * @param {Injector} injector
 * @param {Canvas} canvas
 */
export default function BpmnSpaceTool(injector, canvas) {
  injector.invoke(SpaceTool, this);

  this._canvas = canvas;
}

BpmnSpaceTool.$inject = [
  'injector',
  'canvas'
];

inherits(BpmnSpaceTool, SpaceTool);

/**
 * @param {Shape[]} elements
 * @param {Axis} axis
 * @param {Point} delta
 * @param {number} start
 *
 * @return {Object}
 */
BpmnSpaceTool.prototype.calculateAdjustments = function(elements, axis, delta, start) {

  var canvasRoot = this._canvas.getRootElement(),
      spaceRoot = elements[0] === canvasRoot ? null : elements[0],
      enclosedArtifacts = [];

  // ensure
  if (spaceRoot) {
    enclosedArtifacts = values(
      getEnclosedElements(
        canvasRoot.children.filter(
          (child) => is(child, 'bpmn:Artifact')
        ),
        getBBox(spaceRoot)
      )
    );
  }

  const elementsToMove = [ ...elements, ...enclosedArtifacts ];

  var adjustments = SpaceTool.prototype.calculateAdjustments.call(this, elementsToMove, axis, delta, start);

  // do not resize:
  //
  // * text annotations (horizontally/vertically)
  // * empty horizontal pools (vertically)
  // * empty vertical pools (horizontally)
  adjustments.resizingShapes = adjustments.resizingShapes.filter(function(shape) {

    if (is(shape, 'bpmn:TextAnnotation')) {
      return false;
    }

    if (isCollapsedPool(shape)) {
      if (axis === 'y' && isHorizontal(shape) || axis === 'x' && !isHorizontal(shape)) {
        return false;
      }
    }

    return true;
  });

  return adjustments;
};


// helpers ///////////

function isCollapsedPool(shape) {
  return is(shape, 'bpmn:Participant') && !getBusinessObject(shape).processRef;
}