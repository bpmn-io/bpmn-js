'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

var every = require('lodash/collection/every');

var round = Math.round;


/**
 * BPMN specific create lane behavior
 */
function CreateLaneBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * wrap existing elements with new lane
   */

  this.preExecute('shape.create', function(context) {

    var parent = context.parent,
        shape = context.shape,
        children = parent.children;

    // check whether we need to wrap
    // the existing elements into the new lane
    if (is(shape, 'bpmn:Lane')) {

      var labelOffset = 0;

      if (is(parent, 'bpmn:Participant') || is(parent, 'bpmn:Lane')) {
        labelOffset = 30;
      }

      shape.width = parent.width - labelOffset;
      context.position.x = round(parent.x + labelOffset / 2 + parent.width / 2);

      // wrap + adjust lane height + y to fit parent
      if (every(children, isNonLane)) {
        shape.height = parent.height;
        context.position.y = round(parent.y + parent.height / 2);

        context.wrapInLane = children.slice();
      }
    }
  }, true);


  this.postExecute('shape.create', function(context) {

    var shape = context.shape,
        wrapInLane = context.wrapInLane;

    if (wrapInLane) {

      // wrap existing elements onto the new lane,
      // if this is the first lane in the parent
      modeling.moveElements(wrapInLane, { x: 0, y: 0 }, shape);
    }

  }, true);

}

CreateLaneBehavior.$inject = [ 'eventBus', 'modeling' ];

inherits(CreateLaneBehavior, CommandInterceptor);

module.exports = CreateLaneBehavior;


function isNonLane(element) {
  return !is(element, 'bpmn:Lane');
}