'use strict';

function BpmnKeyBindings(keyboard, spaceTool, lassoTool, handTool, directEditing,
  selection, canvas, elementRegistry, editorActions) {

  var actions = {
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
      spaceTool.toggle();
    },
    lassoTool: function() {
      lassoTool.toggle();
    },
    handTool: function() {
      handTool.toggle();
    },
    directEditing: function() {
      var currentSelection = selection.get();

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }
    }
  };

  editorActions.register(actions);

  keyboard.addListener(function(key, modifiers) {

    // ctrl + a -> select all elements
    if (key === 65 && keyboard.isCmd(modifiers)) {
      editorActions.trigger('selectElements');

      return true;
    }

    if (keyboard.hasModifier(modifiers)) {
      return;
    }

    // s -> activate space tool
    if (key === 83) {
      editorActions.trigger('spaceTool');

      return true;
    }

    // l -> activate lasso tool
    if (key === 76) {
      editorActions.trigger('lassoTool');

      return true;
    }

    // h -> activate hand tool
    if (key === 72) {
      editorActions.trigger('handTool');

      return true;
    }

    // e -> activate direct editing
    if (key === 69) {
      editorActions.trigger('directEditing');

      return true;
    }
  });
}

BpmnKeyBindings.$inject = [
  'keyboard',
  'spaceTool',
  'lassoTool',
  'handTool',
  'directEditing',
  'selection',
  'canvas',
  'elementRegistry',
  'editorActions'
];

module.exports = BpmnKeyBindings;
