'use strict';

var _ = require('lodash');


/**
 * A provider for BPMN 2.0 elements context pad
 *
 * @param {ContextPad} contextPad
 */
function ContextPadProvider(contextPad, directEditing, modeling, selection, connect) {

  contextPad.registerProvider(this);

  this._selection = selection;
  this._directEditing = directEditing;
  this._modeling = modeling;

  this._connect = connect;
}

ContextPadProvider.$inject = [ 'contextPad', 'directEditing', 'modeling', 'selection', 'connect' ];


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var directEditing = this._directEditing,
      modeling = this._modeling,
      selection = this._selection,
      connect = this._connect;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  var bpmnElement = element.businessObject;

  function startConnect(event, element) {
    connect.start(event, element, null);

    event.preventDefault();
  }

  function append(element, type) {

    var target;

    if (type === 'bpmn:TextAnnotation') {
      target = modeling.appendTextAnnotation(element, type);
    } else {
      target = modeling.appendFlowNode(element, type);
    }

    selection.select(target);
    directEditing.activate(target);
  }

  if (bpmnElement.$instanceOf('bpmn:FlowNode') &&
      !bpmnElement.$instanceOf('bpmn:EndEvent')) {

    _.extend(actions, {
      'action.model-event': {
        group: 'model',
        className: 'icon-end-event',
        action: function(event, element) {
          append(element, 'bpmn:EndEvent');
        }
      },
      'action.model-gateway': {
        group: 'model',
        className: 'icon-gateway',
        action: function(e) {
          append(element, 'bpmn:ExclusiveGateway');
        }
      },
      'action.model-task': {
        group: 'model',
        className: 'icon-task',
        action: function() {
          append(element, 'bpmn:Task');
        }
      },
      'action.model-intermediate-event': {
        group: 'model',
        className: 'icon-intermediate-event',
        action: function() {
          append(element, 'bpmn:IntermediateThrowEvent');
        }
      },
      'action.model-text-Annotation': {
        group: 'model',
        className: 'icon-text-annotation',
        action: function() {
          append(element, 'bpmn:TextAnnotation');
        }
      },
      'action.connect': {
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
    'action.delete': {
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
