'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette provider for BPMN 2.0 elements.
 */
function PaletteProvider(palette, create, elementFactory, bpmnFactory, moddle) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  this._moddle = moddle;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [ 'palette', 'create', 'elementFactory', 'bpmnFactory', 'moddle' ];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory;

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    return {
      group: group,
      className: className,
      title: title || 'Create ' + type,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  var REPLACE_OPTIONS = require('../replace/ReplaceOptions');

  var startEventsHtml =
    '<div class="expanded-entry">' +
      '<div class="expander">' +
        REPLACE_OPTIONS.START_EVENT
          .filter(function(entry) { return entry.target.type === 'bpmn:StartEvent'; })
          .map(function(entry) {
            return '<div class="entry ' + entry.className + '" draggable="true" data-action="create-all-start-events" data-cls="' + entry.className + '"></div>';
          }).join('') +
      '</div>' +
    '</div>';

  var endEventsHtml =
    '<div class="expanded-entry">' +
      '<div class="expander">' +
        REPLACE_OPTIONS.END_EVENT
          .filter(function(entry) { return entry.target.type === 'bpmn:EndEvent'; })
          .map(function(entry) {
            return '<div class="entry ' + entry.className + '" draggable="true" data-action="create-all-end-events" data-cls="' + entry.className + '"></div>';
          }).join('') +
      '</div>' +
    '</div>';

  var intermediateEventsHtml =
    '<div class="expanded-entry">' +
      '<div class="expander">' +
        REPLACE_OPTIONS.INTERMEDIATE_EVENT
          .filter(function(entry) { return entry.target.type === 'bpmn:IntermediateThrowEvent' || entry.target.type === 'bpmn:IntermediateCatchEvent'; })
          .map(function(entry) {
            return '<div class="entry ' + entry.className + '" draggable="true" data-action="create-all-intermediate-events" data-cls="' + entry.className + '"></div>';
          }).join('') +
      '</div>' +
    '</div>';

  var tasksHtml =
    '<div class="expanded-entry">' +
      '<div class="expander">' +
        REPLACE_OPTIONS.TASK.map(function(entry) {
          return '<div class="entry ' + entry.className + '" draggable="true" data-action="create-all-tasks" data-cls="' + entry.className + '"></div>';
        }).join('') +
      '</div>' +
    '</div>';

  var gatewayHtml =
    '<div class="expanded-entry">' +
      '<div class="expander">' +
        REPLACE_OPTIONS.GATEWAY.map(function(entry) {
          return '<div class="entry ' + entry.className + '" draggable="true" data-action="create-all-gateways" data-cls="' + entry.className + '"></div>';
        }).join('') +
      '</div>' +
    '</div>';


  var bpmnFactory = this._bpmnFactory;
  var moddle = this._moddle;

  function createFactoryFn(options) {

    return function(event) {

      console.log(event);

      var element = event.delegateTarget;
      var cls = element.getAttribute('data-cls');

      var entry = options.filter(function(e) {
        return e.className === cls;
      })[0];

      var target = entry.target;

      var type = target.type,
          businessObject = bpmnFactory.create(type);

      var newElement = {
        type: type,
        businessObject: businessObject
      };

      // initialize custom BPMN extensions

      if (target.eventDefinition) {
        var eventDefinitions = businessObject.get('eventDefinitions'),
            eventDefinition = moddle.create(target.eventDefinition);

        eventDefinitions.push(eventDefinition);
      }

      var shape = elementFactory.createShape(newElement);

      create.start(event, shape);
    };
  }

  assign(actions, {
    'create-all-start-events': {
      html: startEventsHtml,
      action: {
        dragstart: createFactoryFn(REPLACE_OPTIONS.START_EVENT),
        click: createFactoryFn(REPLACE_OPTIONS.START_EVENT)
      }
    },
    'create-all-intermediate-events': {
      html: intermediateEventsHtml,
      action: {
        dragstart: createFactoryFn(REPLACE_OPTIONS.INTERMEDIATE_EVENT),
        click: createFactoryFn(REPLACE_OPTIONS.INTERMEDIATE_EVENT)
      }
    },
    'create-all-end-events': {
      html: endEventsHtml,
      action: {
        dragstart: createFactoryFn(REPLACE_OPTIONS.END_EVENT),
        click: createFactoryFn(REPLACE_OPTIONS.END_EVENT)
      }
    },
    'create-all-tasks': {
      html: tasksHtml,
      action: {
        dragstart: createFactoryFn(REPLACE_OPTIONS.TASK),
        click: createFactoryFn(REPLACE_OPTIONS.TASK)
      }
    },
    'create-all-gateways': {
      html: gatewayHtml,
      action: {
        dragstart: createFactoryFn(REPLACE_OPTIONS.GATEWAY),
        click: createFactoryFn(REPLACE_OPTIONS.GATEWAY)
      }
    },
    /*'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'icon-start-event-none'
    ),
    'create.intermediate-event': createAction(
      'bpmn:IntermediateThrowEvent', 'event', 'icon-intermediate-event-none'
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'icon-end-event-none'
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'icon-gateway-xor'
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'icon-task'
    ),*/
    'create.subprocess-collapsed': createAction(
      'bpmn:SubProcess', 'activity', 'icon-subprocess-collapsed', 'Sub Process (collapsed)',
      { isExpanded: false }
    ),
    'create.subprocess-expanded': createAction(
      'bpmn:SubProcess', 'activity', 'icon-subprocess-expanded', 'Sub Process (expanded)',
      { isExpanded: true }
    )
  });

  return actions;
};
