'use strict';

var inherits = require('inherits');

var EditorActions = require('diagram-js/lib/features/editor-actions/EditorActions');

var filter = require('lodash/collection/filter');

var is = require('../../util/ModelUtil').is;


function BpmnEditorActions(
    injector,
    canvas, elementRegistry, selection,
    spaceTool,
    lassoTool,
    handTool,
    globalConnect,
    distributeElements,
    alignElements,
    directEditing,
    searchPad,
    eventBus) {

  injector.invoke(EditorActions, this);

  var readOnly;

  eventBus.on('readOnly.changed', function (e) {
    readOnly = e.readOnly;
  });

  this.register({
    selectElements: function() {
      // select all elements except for the invisible
      // root element
      var rootElement = canvas.getRootElement();

      var elements = elementRegistry.filter(function(element) {
        return element != rootElement;
      });

      selection.select(elements);
    },
    spaceTool: function() {
      if (readOnly) {
        return;
      }
      spaceTool.toggle();
    },
    lassoTool: function() {
      if (readOnly) {
        return;
      }
      lassoTool.toggle();
    },
    handTool: function() {
      handTool.toggle();
    },
    globalConnectTool: function() {
      if (readOnly) {
        return;
      }
      globalConnect.toggle();
    },
    distributeElements: function(opts) {
      if (readOnly) {
        return;
      }

      var currentSelection = selection.get(),
          type = opts.type;

      if (currentSelection.length) {
        distributeElements.trigger(currentSelection, type);
      }
    },
    alignElements: function(opts) {
      if (readOnly) {
        return;
      }

      var currentSelection = selection.get(),
          aligneableElements = [],
          type = opts.type;

      if (currentSelection.length) {
        aligneableElements = filter(currentSelection, function(element) {
          return !is(element, 'bpmn:Lane');
        });

        alignElements.trigger(aligneableElements, type);
      }
    },
    directEditing: function() {
      if (readOnly) {
        return;
      }

      var currentSelection = selection.get();

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }
    },
    find: function() {
      searchPad.toggle();
    }
  });
}

inherits(BpmnEditorActions, EditorActions);

BpmnEditorActions.$inject = [
  'injector',
  'canvas', 'elementRegistry', 'selection',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'distributeElements',
  'alignElements',
  'directEditing',
  'searchPad',
  'eventBus'
];

module.exports = BpmnEditorActions;