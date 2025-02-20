import inherits from 'inherits-browser';

import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';

import { getEnclosedElements, getBBox } from 'diagram-js/lib/util/Elements';

import { getBusinessObject, is, isAny } from '../../util/ModelUtil';

import { isHorizontal } from '../../util/DiUtil';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../model/Types').Shape} Shape
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
 * @param {Shape[]} elements
 * @param {Axis} axis
 * @param {Point} delta
 * @param {number} start
 *
 * @return {Object}
 */
BpmnSpaceTool.prototype.calculateAdjustments = function(elements, axis, delta, start) {

  // Make sure elements positioned on the root (e.g. text annotations)
  // are moved when the participant enclosing them is resized.
  const shapesToMove = [ 'bpmn:TextAnnotation' ];
  const participants = elements.filter(shape => is(shape, 'bpmn:Participant'));

  const rootElements = participants.reduce((result, participant) => {

    const rootChildren = participant.parent.children;

    const elementsToMove = rootChildren.filter(child => isAny(child, shapesToMove));

    if (!elementsToMove.length) {
      return result;
    }

    const bbox = getBBox(participant);

    const enclosed = Object.values(getEnclosedElements(elementsToMove, bbox));

    return [ ...result, ...enclosed ];
  }, []);

  const elementsToMove = [ ...elements, ...rootElements ];

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