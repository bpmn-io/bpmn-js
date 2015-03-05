'use strict';


var assign = require('lodash/object/assign');

var getReplacementMenuEntries = require('./ReplaceMenuFactory').getReplacementMenuEntries;


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

  function replaceElement(element, newType, options) {
    replace.replaceElement(element, {type: newType}, options);
  }

  function getPosition(element) {

    var Y_OFFSET = 5;

    var diagramContainer = canvas.getContainer(),
        pad = contextPad.getPad(element).html;

    var diagramRect = diagramContainer.getBoundingClientRect(),
        padRect = pad.getBoundingClientRect();

    var top = padRect.top - diagramRect.top;

    var pos = {
      x: padRect.left,
      y: top + padRect.height + Y_OFFSET
    };

    return pos;
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

    if (!bpmnElement.$instanceOf('bpmn:EndEvent') &&
        !bpmnElement.$instanceOf('bpmn:EventBasedGateway')) {

      assign(actions, {
        'append.end-event': appendAction('bpmn:EndEvent', 'icon-01-none-end-event'),
        'append.gateway': appendAction('bpmn:ExclusiveGateway', 'icon-exclusive-gateway'),
        'append.append-task': appendAction('bpmn:Task', 'icon-task'),
        'append.intermediate-event': appendAction('bpmn:IntermediateThrowEvent',
                                                  'icon-01-none-intermediate-throw-event'),
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

    if (bpmnElement.$instanceOf('bpmn:EventBasedGateway')) {

      assign(actions, {
        'append.receive-task': appendAction('bpmn:ReceiveTask', 'icon-receive-task'),
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
    if (!bpmnElement.$instanceOf('bpmn:SubProcess')) {
      assign(actions, {
        'replace': {
          group: 'edit',
          className: 'icon-screw-wrench',
          action: {

            click: function(event, element) {
              var pos = getPosition(element);

              var entries = getReplacementMenuEntries(element, replaceElement);

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
