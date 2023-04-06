import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import {
  getChildLanes
} from '../util/LaneUtil';

import {
  eachElement
} from 'diagram-js/lib/util/Elements';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../../space-tool/BpmnSpaceTool').default} SpaceTool
 */

var LOW_PRIORITY = 500;


/**
 * BPMN specific delete lane behavior.
 *
 * @param {EventBus} eventBus
 * @param {SpaceTool} spaceTool
 */
export default function DeleteLaneBehavior(eventBus, spaceTool) {

  CommandInterceptor.call(this, eventBus);


  function compensateLaneDelete(shape, oldParent) {

    var siblings = getChildLanes(oldParent);

    var topAffected = [];
    var bottomAffected = [];

    eachElement(siblings, function(element) {

      if (element.y > shape.y) {
        bottomAffected.push(element);
      } else {
        topAffected.push(element);
      }

      return element.children;
    });

    if (!siblings.length) {
      return;
    }

    var offset;

    if (bottomAffected.length && topAffected.length) {
      offset = shape.height / 2;
    } else {
      offset = shape.height;
    }

    var topAdjustments,
        bottomAdjustments;

    if (topAffected.length) {
      topAdjustments = spaceTool.calculateAdjustments(
        topAffected, 'y', offset, shape.y - 10);

      spaceTool.makeSpace(
        topAdjustments.movingShapes,
        topAdjustments.resizingShapes,
        { x: 0, y: offset }, 's');
    }

    if (bottomAffected.length) {
      bottomAdjustments = spaceTool.calculateAdjustments(
        bottomAffected, 'y', -offset, shape.y + shape.height + 10);

      spaceTool.makeSpace(
        bottomAdjustments.movingShapes,
        bottomAdjustments.resizingShapes,
        { x: 0, y: -offset }, 'n');
    }
  }


  /**
   * Adjust sizes of other lanes after lane deletion
   */
  this.postExecuted('shape.delete', LOW_PRIORITY, function(event) {

    var context = event.context,
        hints = context.hints,
        shape = context.shape,
        oldParent = context.oldParent;

    // only compensate lane deletes
    if (!is(shape, 'bpmn:Lane')) {
      return;
    }

    // compensate root deletes only
    if (hints && hints.nested) {
      return;
    }

    compensateLaneDelete(shape, oldParent);
  });
}

DeleteLaneBehavior.$inject = [
  'eventBus',
  'spaceTool'
];

inherits(DeleteLaneBehavior, CommandInterceptor);