'use strict';


var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');



/**
 * A provider for BPMN 2.0 elements context pad
 */
function ContextPadProvider(contextPad, modeling, elementFactory,
                            connect, create, popupMenu,
                            replace, canvas) {

  contextPad.registerProvider(this);

  this._contextPad = contextPad;

  this._modeling = modeling;

  this._elementFactory = elementFactory;
  this._connect = connect;
  this._create = create;
  this._popupMenu = popupMenu;
  this._replace = replace;
  this._canvas  = canvas;
}

ContextPadProvider.$inject = [
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'replace',
  'canvas'
];

ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var contextPad = this._contextPad,
      modeling = this._modeling,

      elementFactory = this._elementFactory,
      connect = this._connect,
      create = this._create,
      popupMenu = this._popupMenu,
      replace = this._replace,
      canvas = this._canvas;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  var bpmnElement = element.businessObject;

  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }

  function removeElement(e) {
    if (element.waypoints) {
      modeling.removeConnection(element);
    } else {
      modeling.removeShape(element);
    }
  }

  function replaceElement(element, newType, newBusinessAtt) {
    replace.replaceElement(element, {type: newType}, newBusinessAtt);
  }

  function getPosition(element) {

    var Y_OFFSET = 20;

    var pad = contextPad.getPad(element);
    var rect = pad.html.getBoundingClientRect();

    var zoom = 1 / canvas.zoom();

    var pos = {
      x: rect.left,
      y: (rect.top - rect.height * zoom / 2) + rect.height  + Y_OFFSET
    };

    return pos;
  }

  function getReplacementMenuEntries(element) {

    function addMenuEntry(label, newType, newBusinessAtt, actionName, className) {

      function appendListener() {
        replaceElement(element, newType, newBusinessAtt);
      }

      return {
        label: label,
        className: className,
        action: {
          name: actionName,
          handler: appendListener
        }
      };
    }

    // var startEventReplace = [];
    // var interEventReplace = [];
    // var endEventReplace = [];

    var gatewayReplace = [
      {
        label: 'Exclusive Gateway',
        actionName: 'replace-with-exclusive-gateway',
        className: 'icon-exclusive-gateway-variant-1',
        targetType: 'bpmn:ExclusiveGateway'
      },
      {
        label: 'Parallel Gateway',
        actionName: 'replace-with-parallel-gateway',
        className: 'icon-parallel-gateway',
        targetType: 'bpmn:ParallelGateway'
      },
      {
        label: 'Inclusive Gateway',
        actionName: 'replace-with-inclusive-gateway',
        className: 'icon-inclusive-gateway',
        targetType: 'bpmn:InclusiveGateway'
      },
      {
        label: 'Complex Gateway',
        actionName: 'replace-with-complex-gateway',
        className: 'icon-complex-gateway',
        targetType: 'bpmn:ComplexGateway'
      },
      {
        label: 'Event based Gateway',
        actionName: 'replace-with-event-based-gateway',
        className: 'icon-event-based-gateway',
        targetType: 'bpmn:EventBasedGateway',
        newBusinessAtt: {instantiate: false, eventGatewayType: 'Exclusive'}
      },
      {
        label: 'Event based instantiating Gateway',
        actionName: 'replace-with-exclusive-event-based-gateway',
        className: 'icon-exclusive-event-based',
        targetType: 'bpmn:EventBasedGateway',
        newBusinessAtt: {instantiate: true, eventGatewayType: 'Exclusive'}
      },
      {
        label: 'Parallel Event based instantiating Gateway',
        actionName: 'replace-with-parallel-event-based-instantiate-gateway',
        className: 'icon-parallel-event-based-instantiate-gateway',
        targetType: 'bpmn:EventBasedGateway',
        newBusinessAtt: {instantiate: true, eventGatewayType: 'Parallel'}
      }
    ];

    var taskReplace = [
      {
        label: 'Send Task',
        actionName: 'replace-with-send-task',
        className: 'icon-send',
        targetType: 'bpmn:SendTask'
      },
      {
        label: 'Receive Task',
        actionName: 'replace-with-receive-task',
        className: 'icon-receive',
        targetType: 'bpmn:ReceiveTask'
      },
      {
        label: 'User Task',
        actionName: 'replace-with-user-task',
        className: 'icon-user',
        targetType: 'bpmn:UserTask'
      },
      {
        label: 'Manual Task',
        actionName: 'replace-with-manual-task',
        className: 'icon-manual',
        targetType: 'bpmn:ManualTask'
      },
      {
        label: 'Business Rule Task',
        actionName: 'replace-with-rule-task',
        className: 'icon-business-rule',
        targetType: 'bpmn:BusinessRuleTask'
      },
      {
        label: 'Service Task',
        actionName: 'replace-with-service-task',
        className: 'icon-service',
        targetType: 'bpmn:ServiceTask'
      },
      {
        label: 'Script Task',
        actionName: 'replace-with-script-task',
        className: 'icon-script',
        targetType: 'bpmn:ScriptTask'
      }
    ];

    var menuEntries = [];

    if (element.businessObject.$instanceOf('bpmn:Event')) {

      console.warn('Replace for event is not implemented yet.');
    } else if (element.businessObject.$instanceOf('bpmn:Gateway')) {

      forEach(gatewayReplace, function(definition) {

        var entry = addMenuEntry(definition.label, definition.targetType, definition.newBusinessAtt,
                                  definition.actionName, definition.className);
        menuEntries.push(entry);
      });
    } else if (element.businessObject.$instanceOf('bpmn:FlowNode')) {

      forEach(taskReplace, function(definition) {

        var entry = addMenuEntry(definition.label, definition.targetType, {},
                                  definition.actionName, definition.className);
        menuEntries.push(entry);
      });
    }

    return menuEntries;
  }

  function appendAction(type, className) {

    function appendListener(event, element) {
      var shape = elementFactory.createShape({ type: type });
      create.start(event, shape, element);
    }

    return {
      group: 'model',
      className: className,
      action: {
        dragstart: appendListener,
        click: appendListener
      }
    };
  }

  if (bpmnElement.$instanceOf('bpmn:FlowNode')) {

    if (!bpmnElement.$instanceOf('bpmn:EndEvent')) {

      assign(actions, {
        'append.end-event': appendAction('bpmn:EndEvent', 'icon-end-event'),
        'append.gateway': appendAction('bpmn:ExclusiveGateway', 'icon-gateway'),
        'append.append-task': appendAction('bpmn:Task', 'icon-task'),
        'append.intermediate-event': appendAction('bpmn:IntermediateThrowEvent', 'icon-intermediate-event'),
        'connect': {
          group: 'connect',
          className: 'icon-connection',
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    assign(actions, {
      'append.text-annotation': appendAction('bpmn:TextAnnotation', 'icon-text-annotation')
    });


    // Replace menu entry
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'icon-screw-wrench',
        action: {

          click: function(event, element) {
            var pos = getPosition(element);

            var entries = getReplacementMenuEntries(element);

            popupMenu.open(
              pos,
              entries,
              { className: 'replace-menu' }
            );
          }
        }
      }
    });
  }

  // Delete Element Entry
  assign(actions, {
    'delete': {
      group: 'edit',
      className: 'icon-trash',
      action: {
        click: removeElement,
        dragstart: removeElement
      }
    }
  });

  return actions;
};


module.exports = ContextPadProvider;
