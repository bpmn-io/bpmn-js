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

// Commands that provide a shape or connection whose references must be updated.
var categoryValueRefShapeAndConnectionEvents = [
  'connection.create',
  'connection.delete',
  'connection.layout',
  'connection.move',
  'connection.reconnect',
  'connection.updateWaypoints',
  'shape.create',
  'shape.delete',
  'shape.move',
  'shape.resize'
];

// Commands that bracket a complete reference update, including nested commands.
var categoryValueRefUpdateEvents = [
  ...categoryValueRefShapeAndConnectionEvents,
  'elements.create',
  'elements.delete',
  'elements.move',
  'label.create',
  'spaceTool'
];

/**
 * Synchronizes group category references after geometry changes.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function UpdateCategoryValueRefsBehavior(eventBus, modeling) {

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
      modeling.updateCategoryValueRefs(
        Array.from(context.affectedFlowElements),
        Array.from(context.affectedGroupEntries.values())
      );

      context = null;
    }

    return triggerUpdate;
  }

  /**
   * Sets up the context for category value reference updates before executing
   * commands that may affect them.
   */
  this.preExecute(categoryValueRefUpdateEvents, HIGH_PRIORITY, function() {
    initContext();
  });

  /**
   * Releases the context for category value reference updates after executing
   * commands that may affect them.
   */
  this.postExecuted(categoryValueRefUpdateEvents, LOW_PRIORITY, function() {
    releaseContext();
  });

  /**
   * Handles updates to category value references for shapes and connections.
   */
  this.preExecute(categoryValueRefShapeAndConnectionEvents, function(event) {
    var shape = event.context.connection || event.context.shape,
        updateContext = getContext();

    if (!shape || shape.labelTarget) {
      return;
    }

    if (is(shape, 'bpmn:FlowElement')) {
      updateContext.addFlowElement(shape);
    }

    if (is(shape, 'bpmn:Group')) {
      updateContext.addGroup(shape);
    }
  });

  this.preExecute('label.create', function(event) {
    var labelTarget = event.context.labelTarget;

    if (is(labelTarget, 'bpmn:Group')) {
      getContext().addGroup(labelTarget);
    }
  });
}

UpdateCategoryValueRefsBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(UpdateCategoryValueRefsBehavior, CommandInterceptor);


function UpdateContext() {

  this.affectedFlowElements = new Set();
  this.affectedGroupEntries = new Map();

  this.counter = 0;

  this.addFlowElement = function(flowElement) {
    this.affectedFlowElements.add(flowElement);
  };

  this.addGroup = function(group) {
    if (!this.affectedGroupEntries.has(group)) {
      this.affectedGroupEntries.set(group, {
        categoryValue: group.businessObject.categoryValueRef,
        groupShape: group
      });
    }
  };

  this.enter = function() {
    this.counter++;
  };

  this.leave = function() {
    this.counter--;

    return !this.counter;
  };
}
