/**
 * BPMN 2.0 specific key bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
export default function BpmnKeyBindings(keyboard, editorActions) {

  keyboard.addListener(function(key, modifiers) {

    // ctrl + a -> select all elements
    if (key === 65 && keyboard.isCmd(modifiers)) {
      editorActions.trigger('selectElements');

      return true;
    }

    // ctrl + f -> search labels
    if (key === 70 && keyboard.isCmd(modifiers)) {
      editorActions.trigger('find');

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

    // c -> activate global connect tool
    if (key === 67) {
      editorActions.trigger('globalConnectTool');

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
  'editorActions'
];