'use strict';


function BpmnKeyBindings(keyboard, spaceTool, lassoTool) {

  keyboard.addListener(function(key, modifiers) {

    if (keyboard.hasModifier(modifiers)) {
      return;
    }

    // S -> activate space tool
    if (key === 83) {
      spaceTool.activateSelection();

      return true;
    }

    // M -> activate multi select tool
    if (key === 77) {
      lassoTool.activateSelection();

      return true;
    }
  });
}

BpmnKeyBindings.$inject = [ 'keyboard', 'spaceTool', 'lassoTool' ];

module.exports = BpmnKeyBindings;