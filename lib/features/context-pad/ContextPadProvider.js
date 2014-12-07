'use strict';

var _ = require('lodash');


/**
 * A provider for BPMN 2.0 elements context pad
 */
function ContextPadProvider(contextPad, directEditing, modeling, selection, elementFactory, connect, create) {

  contextPad.registerProvider(this);

  this._directEditing = directEditing;

  this._modeling = modeling;
  this._selection = selection;

  this._elementFactory = elementFactory;
  this._connect = connect;
  this._create = create;
}

ContextPadProvider.$inject = [ 'contextPad', 'directEditing', 'modeling', 'selection', 'elementFactory', 'connect', 'create' ];


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var directEditing = this._directEditing,
      modeling = this._modeling,
      selection = this._selection,
      elementFactory = this._elementFactory,
      connect = this._connect,
      create = this._create;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  var bpmnElement = element.businessObject;

  function startConnect(event, element) {
    connect.start(event, element, null);
  }

  function append(element, type) {
    var target = modeling.appendShape(element, { type: type });

    selection.select(target);
    directEditing.activate(target);
  }

  function appendAction(type, className) {
    return {
      group: 'model',
      className: className,
      action: {
        dragstart: function(event, element) {
          var shape = elementFactory.createShape({ type: type });
          create.start(event, shape, element);
        },
        click: function(event, element) {
          append(element, type);
        }
      }
    };
  }

  if (bpmnElement.$instanceOf('bpmn:FlowNode')) {

    if (!bpmnElement.$instanceOf('bpmn:EndEvent')) {

      _.extend(actions, {
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

    _.extend(actions, {
      'append.text-annotation': appendAction('bpmn:TextAnnotation', 'icon-text-annotation')
    });
  }

  _.extend(actions, {
    'delete': {
      group: 'edit',
      className: 'icon-trash',
      action: function(e) {
        modeling.removeShape(element);
      }
    }
  });

  return actions;
};


module.exports = ContextPadProvider;
