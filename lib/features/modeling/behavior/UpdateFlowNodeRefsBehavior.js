import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  is
} from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

var LOW_PRIORITY = 500,
    HIGH_PRIORITY = 5000;

// Commands that provide a shape whose lane references must be updated.
var laneRefShapeEvents = [
  'shape.create',
  'shape.delete',
  'shape.move',
  'shape.resize'
];

// Commands that bracket a complete lane reference update, including nested commands.
var laneRefUpdateEvents = [
  ...laneRefShapeEvents,
  'spaceTool',
  'lane.add',
  'lane.resize',
  'lane.split',
  'elements.create',
  'elements.delete',
  'elements.move'
];

/**
 * Synchronizes lane flow node references after geometry changes.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function UpdateFlowNodeRefsBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  var context;


  function initContext() {
    context = context || new UpdateContext();
    context.enter();

    return context;
  }

  function getContext() {
    if (!context) {
      throw new Error('out of bounds release');
    }

    return context;
  }

  function releaseContext() {

    if (!context) {
      throw new Error('out of bounds release');
    }

    var triggerUpdate = context.leave();

    if (triggerUpdate) {
      modeling.updateLaneRefs(context.flowNodes, context.lanes);

      context = null;
    }

    return triggerUpdate;
  }


  /**
   * Sets up the context for lane reference updates before executing commands
   * that may affect them.
   */
  this.preExecute(laneRefUpdateEvents, HIGH_PRIORITY, function() {
    initContext();
  });

  /**
   * Releases the context for lane reference updates after executing commands
   * that may affect them.
   */
  this.postExecuted(laneRefUpdateEvents, LOW_PRIORITY, function() {
    releaseContext();
  });

  /**
   * Handles updates to lane references for shapes.
   */
  this.preExecute(laneRefShapeEvents, function(event) {

    var context = event.context,
        shape = context.shape;

    var updateContext = getContext();

    // no need to update labels
    if (!shape || shape.labelTarget) {
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

UpdateFlowNodeRefsBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(UpdateFlowNodeRefsBehavior, CommandInterceptor);


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