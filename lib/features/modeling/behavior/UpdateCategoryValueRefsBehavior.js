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
      modeling.updateCategoryValueRefs(context.flowElementEntries, context.groupEntries);

      context = null;
    }

    return triggerUpdate;
  }

  var categoryValueRefUpdateEvents = [
    'connection.create',
    'connection.delete',
    'connection.layout',
    'connection.move',
    'connection.reconnect',
    'connection.updateWaypoints',
    'elements.create',
    'elements.delete',
    'elements.move',
    'label.create',
    'shape.create',
    'shape.delete',
    'shape.move',
    'shape.resize',
    'spaceTool'
  ];

  this.preExecute(categoryValueRefUpdateEvents, HIGH_PRIORITY, function() {
    initContext();
  });

  this.postExecuted(categoryValueRefUpdateEvents, LOW_PRIORITY, function() {
    releaseContext();
  });

  this.preExecute([
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
  ], function(event) {
    var shape = event.context.connection || event.context.shape,
        updateContext = getContext();

    var parent = event.context.parent || shape.parent;

    if (is(shape, 'bpmn:FlowElement')) {
      updateContext.addFlowElement(shape, parent);
    }

    if (is(shape, 'bpmn:Group') && !shape.labelTarget) {
      updateContext.addGroup(shape, parent);
    }
  });

  this.preExecute('label.create', function(event) {
    var labelTarget = event.context.labelTarget;

    if (is(labelTarget, 'bpmn:Group')) {
      getContext().addGroup(labelTarget, labelTarget.parent);
    }
  });
}

UpdateCategoryValueRefsBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(UpdateCategoryValueRefsBehavior, CommandInterceptor);


function UpdateContext() {

  this.flowElementEntries = [];
  this.groupEntries = [];

  this.counter = 0;

  this.addFlowElement = function(flowElement, parent) {
    var entry = this.flowElementEntries.find(function(entry) {
      return entry.shape === flowElement;
    });

    if (!entry) {
      entry = {
        parents: [],
        shape: flowElement
      };

      this.flowElementEntries.push(entry);
    }

    entry.parents.push(parent);
  };

  this.addGroup = function(group, parent) {
    this.groupEntries.push({
      categoryValue: group.businessObject.categoryValueRef,
      parent: parent,
      shape: group
    });
  };

  this.enter = function() {
    this.counter++;
  };

  this.leave = function() {
    this.counter--;

    return !this.counter;
  };
}
