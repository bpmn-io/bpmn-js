'use strict';

var _ = require('lodash'),
    $ = require('jquery');

/**
 * A palette provider for BPMN 2.0 elements.
 */
function PaletteProvider(palette, modeling, elementRegistry, canvas) {

  this._modeling = modeling;
  this._elementRegistry = elementRegistry;
  this._canvas   = canvas;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [ 'palette', 'modeling', 'elementRegistry', 'canvas' ];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      modeling = this._modeling,
      elementRegistry = this._elementRegistry,
      canvas   = this._canvas;

  var root = elementRegistry.getRoot();
  var vbox = canvas.viewbox();

  var center = {
    x: Math.round(vbox.outer.width  * 1 / vbox.scale / 2),
    y: Math.round(vbox.outer.height * 1 / vbox.scale / 2)
  };

  _.extend(actions, {
    'add.start-event': {
      group: 'model-event',
      className: 'icon-start-event',
      alt: 'Start Event',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:StartEvent'
        }, center, root);
      }
    },
    'add.intermediate-throw-event': {
      group: 'model-event',
      className: 'icon-intermediate-event',
      alt: 'Intermediate Throw Event',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        }, center, root);
      }
    },
    'add.end-event': {
      group: 'model-event',
      className: 'icon-end-event',
      alt: 'End Event',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:EndEvent'
        }, center, root);
      }
    },
    'add.exclusive-gateway': {
      group: 'model-gateway',
      className: 'icon-gateway',
      alt: 'Exclusive Gateway',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:ExclusiveGateway'
        }, center, root);
      }
    },
    'add.task': {
      group: 'model-activity',
      className: 'icon-task',
      alt: 'Task',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:Task'
        }, center, root);
      }
    },
    'add.subProcess-collapsed': {
      group: 'model-activity',
      className: 'icon-subprocess-collapsed',
      alt: 'Sub-Process (collapsed)',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: false
        }, center, root);
      }
    },
    'add.subProcess-expanded': {
      group: 'model-activity',
      className: 'icon-subprocess-expanded',
      alt: 'Sub-Process (expanded)',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: true
        }, center, root);
      }
    }
  });

  return actions;
};