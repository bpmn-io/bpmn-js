'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

var getChildLanes = require('../util/LaneUtil').getChildLanes;

var eachElement = require('diagram-js/lib/util/Elements').eachElement;


/**
 * BPMN specific delete lane behavior
 */
function DeleteLaneBehavior(eventBus, modeling, spaceTool) {

  CommandInterceptor.call(this, eventBus);

  /**
   * adjust sizes of other lanes after lane deletion
   */
  this.postExecute('shape.delete', function(context) {
    var shape = context.shape;

    if (is(shape, 'bpmn:Lane')) {

      var siblings = getChildLanes(context.oldParent);

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
        topAdjustments = spaceTool.calculateAdjustments(topAffected, 'y', offset, shape.y - 10);

        spaceTool.makeSpace(topAdjustments.movingShapes, topAdjustments.resizingShapes, { x: 0, y: offset }, 's');
      }

      if (bottomAffected.length) {
        bottomAdjustments = spaceTool.calculateAdjustments(bottomAffected, 'y', -offset, shape.y + shape.height + 10);

        spaceTool.makeSpace(
          bottomAdjustments.movingShapes,
          bottomAdjustments.resizingShapes,
          { x: 0, y: -offset },
          'n');
      }
    }
  }, true);
}

DeleteLaneBehavior.$inject = [ 'eventBus', 'modeling', 'spaceTool' ];

inherits(DeleteLaneBehavior, CommandInterceptor);

module.exports = DeleteLaneBehavior;