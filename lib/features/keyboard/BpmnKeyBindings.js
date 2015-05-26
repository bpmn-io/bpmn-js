'use strict';


function BpmnKeyBindings(keyboard, spaceTool, lassoTool, directEditing, selection) {

  keyboard.addListener(function(key, modifiers) {

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

BpmnKeyBindings.$inject = [ 'keyboard', 'spaceTool', 'lassoTool', 'directEditing', 'selection' ];

module.exports = BpmnKeyBindings;