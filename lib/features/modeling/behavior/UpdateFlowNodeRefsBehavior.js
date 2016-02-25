'use strict';


var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

var LOW_PRIORITY = 500,
    HIGH_PRIORITY = 5000;


/**
 * BPMN specific delete lane behavior
 */
function UpdateFlowNodeRefsBehavior(eventBus, modeling, i18n) {

  var _i18n = i18n;
  CommandInterceptor.call(this, eventBus);

  /**
   * Ok, this is it:
   *
   * We have to update the Lane#flowNodeRefs _and_
   * FlowNode#lanes with every FlowNode move/resize and
   * Lane move/resize.
   *
   * We want to group that stuff to recompute containments
   * as efficient as possible.
   *
   * Yea!
   */

  // the update context
  var context;


  function initContext() {
    context = context || new UpdateContext();
    context.enter();

    return context;
  }

  function getContext() {
    if (!context) {
      throw new Error(_i18n.t('out of bounds release'));
    }

    return context;
  }

  function releaseContext() {

    if (!context) {
      throw new Error(_i18n.t('out of bounds release'));
    }

    var triggerUpdate = context.leave();

    if (triggerUpdate) {
      modeling.updateLaneRefs(context.flowNodes, context.lanes);

      context = null;
    }

    return triggerUpdate;
  }


  var laneRefUpdateEvents = [
    'spaceTool',
    'lane.add',
    'lane.resize',
    'lane.split',
    'elements.move',
    'elements.delete',
    'shape.create',
    'shape.delete',
    'shape.move',
    'shape.resize'
  ];


  // listen to a lot of stuff to group lane updates

  this.preExecute(laneRefUpdateEvents, HIGH_PRIORITY, function(event) {
    initContext();
  });

  this.postExecuted(laneRefUpdateEvents, LOW_PRIORITY, function(event) {
    releaseContext();
  });


  // Mark flow nodes + lanes that need an update

  this.preExecute([
    'shape.create',
    'shape.move',
    'shape.delete',
    'shape.resize'
  ], function(event) {

    var context = event.context,
        shape = context.shape;

    var updateContext = getContext();

    // no need to update labels
    if (shape.labelTarget) {
      return;
    }

    if (is(shape, 'bpmn:Lane')) {
      updateContext.addLane(shape);
    }

    if (is(shape, 'bpmn:FlowNode')) {
      updateContext.addFlowNode(shape);
    }
  });
}

UpdateFlowNodeRefsBehavior.$inject = [ 'eventBus', 'modeling' , 'i18n'];

inherits(UpdateFlowNodeRefsBehavior, CommandInterceptor);

module.exports = UpdateFlowNodeRefsBehavior;



function UpdateContext() {

  this.flowNodes = [];
  this.lanes = [];

  this.counter = 0;

  this.addLane = function(lane) {
    this.lanes.push(lane);
  };

  this.addFlowNode = function(flowNode) {
    this.flowNodes.push(flowNode);
  };

  this.enter = function() {
    this.counter++;
  };

  this.leave = function() {
    this.counter--;

    return !this.counter;
  };
}