import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import {
  getChildLanes
} from '../util/LaneUtil';

import {
  isHorizontal
} from '../../../util/DiUtil';

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
    var isHorizontalLane = isHorizontal(shape);

    var siblings = getChildLanes(oldParent);

    var topAffected = [];
    var bottomAffected = [];
    var leftAffected = [];
    var rightAffected = [];

    eachElement(siblings, function(element) {

      if (isHorizontalLane) {
        if (element.y > shape.y) {
          bottomAffected.push(element);
        } else {
          topAffected.push(element);
        }
      } else {
        if (element.x > shape.x) {
          rightAffected.push(element);
        } else {
          leftAffected.push(element);
        }
      }

      return element.children;
    });

    if (!siblings.length) {
      return;
    }

    var offset;

    if (isHorizontalLane) {
      if (bottomAffected.length && topAffected.length) {
        offset = shape.height / 2;
      } else {
        offset = shape.height;
      }
    } else {
      if (rightAffected.length && leftAffected.length) {
        offset = shape.width / 2;
      } else {
        offset = shape.width;
      }
    }

    var topAdjustments,
        bottomAdjustments,
        leftAdjustments,
        rightAdjustments;

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

    if (leftAffected.length) {
      leftAdjustments = spaceTool.calculateAdjustments(
        leftAffected, 'x', offset, shape.x - 10);

      spaceTool.makeSpace(
        leftAdjustments.movingShapes,
        leftAdjustments.resizingShapes,
        { x: offset, y: 0 }, 'e');
    }

    if (rightAffected.length) {
      rightAdjustments = spaceTool.calculateAdjustments(
        rightAffected, 'x', -offset, shape.x + shape.width + 10);

      spaceTool.makeSpace(
        rightAdjustments.movingShapes,
        rightAdjustments.resizingShapes,
        { x: -offset, y: 0 }, 'w');
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