/**
 * BPMN 2.0 specific key bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
export default function BpmnKeyBindings(keyboard, editorActions) {

  // ctrl + a -> select all elements
  function selectAll(context) {

    var event = context.event;

    if (event.keyCode === 65 && keyboard.isCmd(event)) {
      editorActions.trigger('selectElements');

      return true;
    }
  }

  // ctrl + f -> search labels
  function find(context) {

    var event = context.event;

    if (event.keyCode === 70 && keyboard.isCmd(event)) {
      editorActions.trigger('find');

      return true;
    }
  }

  // s -> activate space tool
  function spaceTool(context) {

    var event = context.event;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (event.keyCode === 83) {
      editorActions.trigger('spaceTool');

      return true;
    }
  }

  // l -> activate lasso tool
  function lassoTool(context) {

    var event = context.event;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (event.keyCode === 76) {
      editorActions.trigger('lassoTool');

      return true;
    }
  }


  // h -> activate hand tool
  function handTool(context) {

    var event = context.event;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (event.keyCode === 72) {
      editorActions.trigger('handTool');

      return true;
    }
  }

  // c -> activate global connect tool
  function globalConnectTool(context) {

    var event = context.event;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (event.keyCode === 67) {
      editorActions.trigger('globalConnectTool');

      return true;
    }
  }

  // e -> activate direct editing
  function directEditing(context) {

    var event = context.event;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (event.keyCode === 69) {
      editorActions.trigger('directEditing');

      return true;
    }
  }


  keyboard.addListener(selectAll);
  keyboard.addListener(find);
  keyboard.addListener(spaceTool);
  keyboard.addListener(lassoTool);
  keyboard.addListener(handTool);
  keyboard.addListener(globalConnectTool);
  keyboard.addListener(directEditing);
}

BpmnKeyBindings.$inject = [
  'keyboard',
  'editorActions'
];