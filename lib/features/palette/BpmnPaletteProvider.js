'use strict';

var _ = require('lodash'),
    $ = require('jquery');

/**
 * A BPMN instance of the palette.
 */
function BpmnPaletteProvider(eventBus, palette, modeling, elementRegistry, canvas) {

  this._eventBus = eventBus;
  this._palette  = palette;
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;
  this._canvas   = canvas;

  palette.registerProvider(this);
}

module.exports = BpmnPaletteProvider;

BpmnPaletteProvider.$inject = [ 'eventBus', 'palette', 'modeling', 'elementRegistry', 'canvas' ];


BpmnPaletteProvider.prototype.getPaletteEntries = function(element) {

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
      img: '<circle fill="#ffffff" stroke="#000000" style="stroke-width: 1;" r="9" cy="12.5" cx="12.5"></circle>',
      alt: 'Start Event',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:StartEvent'
        }, center, root);
      }
    },
    'add.inter-throw-event': {
      group: 'model-event',
      img: '<circle r="9" stroke="#000000" fill="#ffffff" cx="12.5" cy="12.5" style="stroke-width: 1px;"></circle>' +
           '<circle r="7" stroke="#000000" fill="none"    cx="12.5" cy="12.5" style="stroke-width: 1px;"></circle>',
      alt: 'Intermediate Throw Event',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        }, center, root);
      }
    },
    'add.end-event': {
      group: 'model-event',
      img: '<circle fill="#ffffff" stroke="#000000" style="stroke-width: 2;" r="9" cy="12.5" cx="12.5"/>',
      alt: 'End Event',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:EndEvent'
        }, center, root);
      }
    },
    'add.exclusive-gateway': {
      group: 'model-gateway',
      img: '<rect y="5" x="5" height="15" width="15" stroke="#000000" fill="#ffffff" ' +
           'style="stroke-width: 1px;" transform="rotate(45,12.5,12.5)" />',
      alt: 'Exclusive Gateway',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:ExclusiveGateway'
        }, center, root);
      }
    },
    'add.task': {
      group: 'model-activity',
      img: '<rect fill="#ffffff" stroke="#000000" style="stroke-width: 1;" ry="5" rx="5" height="15" ' +
           'width="20" y="5" x="2.5"></rect>',
      alt: 'Task',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:Task'
        }, center, root);
      }
    },
    'add.subProcess-collapsed': {
      group: 'model-activity',
      img: '<rect fill="#ffffff" stroke="#000000" style="stroke-width: 1;" ry="4" rx="4" height="15" ' +
           '  width="15" y="5" x="5" />' +
           '<path d=" m 12.5,7.5 l 0,10 m -5,-5 l 10,0" fill="none" stroke="#000000" ' +
           '  style="stroke-width: 2px;" />',
      alt: 'Subprocess collapsed',
      action: function(event, element) {
        modeling.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: false
        }, center, root);
      }
    },
    'add.subProcess-expanded': {
      group: 'model-activity',
      img: '<rect fill="#ffffff" stroke="#000000" style="stroke-width: 1;" ry="4" rx="4" height="15" ' +
           '  width="15" y="5" x="5"></rect>' +
           '<path d=" m 7.5,12.5 l 10,0" fill="none" stroke="#000000" ' +
           '  style="stroke-width: 2px;" />',
      alt: 'Subprocess Expanded',
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

BpmnPaletteProvider.prototype.open = function() {
  this._palette.open();
};


BpmnPaletteProvider.prototype.close = function() {
  this._palette.close();
};
