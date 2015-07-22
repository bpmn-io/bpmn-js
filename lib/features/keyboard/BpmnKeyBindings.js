'use strict';

function BpmnKeyBindings(
    keyboard, spaceTool, lassoTool,
    directEditing, selection, canvas,
    elementRegistry) {


  keyboard.addListener(function(key, modifiers) {

    // ctrl + a -> select all elements
    if (key === 65 && keyboard.isCmd(modifiers)) {

      // select all elements except for the invisible
      // root element
      var rootElement = canvas.getRootElement();

      var elements = elementRegistry.filter(function(element) {
        return element != rootElement;
      });

      selection.select(elements);

      return true;
    }

    if (keyboard.hasModifier(modifiers)) {
      return;
    }

    // s -> activate space tool
    if (key === 83) {
      spaceTool.activateSelection();

      return true;
    }

    // l -> activate lasso tool
    if (key === 76) {
      lassoTool.activateSelection();

      return true;
    }

    var currentSelection = selection.get();

    // e -> activate direct editing
    if (key === 69) {
      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }

      return true;
    }
  });
}

BpmnKeyBindings.$inject = [
  'keyboard',
  'spaceTool',
  'lassoTool',
  'directEditing',
  'selection',
  'canvas',
  'elementRegistry'
];

module.exports = BpmnKeyBindings;
