'use strict';

var inherits = require('inherits');

var EditorActions = require('diagram-js/lib/features/editor-actions/EditorActions');

var filter = require('lodash/collection/filter');

var is = require('../../util/ModelUtil').is;

var getBBox = require('diagram-js/lib/util/Elements').getBBox;

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
    modeling) {

  injector.invoke(EditorActions, this);

  this.register({
    selectElements: function() {
      // select all elements except for the invisible
      // root element
      var rootElement = canvas.getRootElement();

      var elements = elementRegistry.filter(function(element) {
        return element !== rootElement;
      });

      selection.select(elements);

      return elements;
    },
    spaceTool: function() {
      spaceTool.toggle();
    },
    lassoTool: function() {
      lassoTool.toggle();
    },
    handTool: function() {
      handTool.toggle();
    },
    globalConnectTool: function() {
      globalConnect.toggle();
    },
    distributeElements: function(opts) {
      var currentSelection = selection.get(),
          type = opts.type;

      if (currentSelection.length) {
        distributeElements.trigger(currentSelection, type);
      }
    },
    alignElements: function(opts) {
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
      var currentSelection = selection.get();

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }
    },
    find: function() {
      searchPad.toggle();
    },
    moveToOrigin: function() {
      var rootElement = canvas.getRootElement(),
          boundingBox,
          elements;

      if (is(rootElement, 'bpmn:Collaboration')) {
        elements = elementRegistry.filter(function(element) {
          return is(element.parent, 'bpmn:Collaboration');
        });
      } else {
        elements = elementRegistry.filter(function(element) {
          return element !== rootElement;
        });
      }

      boundingBox = getBBox(elements);

      modeling.moveElements(elements, { x: -boundingBox.x, y: -boundingBox.y }, rootElement);
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
  'modeling'
];

module.exports = BpmnEditorActions;
