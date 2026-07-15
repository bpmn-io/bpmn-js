import inherits from 'inherits-browser';

import { forEach } from 'min-dash';

import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings';

/**
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('diagram-js/lib/features/editor-actions/EditorActions').default} EditorActions
 * @typedef {import('diagram-js/lib/features/keyboard/Keyboard').default} Keyboard
 */

/**
 * BPMN 2.0 specific keyboard bindings.
 *
 * @param {Injector} injector
 */
export default function BpmnKeyboardBindings(injector) {
  injector.invoke(KeyboardBindings, this);
}

inherits(BpmnKeyboardBindings, KeyboardBindings);

BpmnKeyboardBindings.$inject = [
  'injector'
];


/**
 * The keyboard binding for each editor action: the `key` that triggers it,
 * optionally requiring the `cmd` modifier (CTRL/CMD).
 *
 * @type {Record<string, { key: string, modifier?: 'cmd' }>}
 */
export var SHORTCUTS_KEY_BINDINGS = {
  selectElements: { key: 'A', modifier: 'cmd' },
  find: { key: 'F', modifier: 'cmd' },
  spaceTool: { key: 'S' },
  lassoTool: { key: 'L' },
  handTool: { key: 'H' },
  globalConnectTool: { key: 'C' },
  directEditing: { key: 'E' },
  replaceElement: { key: 'R' }
};


/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
BpmnKeyboardBindings.prototype.registerBindings = function(keyboard, editorActions) {

  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions);

  forEach(SHORTCUTS_KEY_BINDINGS, function(binding, action) {

    if (!editorActions.isRegistered(action)) {
      return;
    }

    var keys = [ binding.key.toLowerCase(), binding.key.toUpperCase() ],
        requiresCmd = binding.modifier === 'cmd';

    keyboard.addListener(function(context) {

      var event = context.keyEvent;

      if (!keyboard.isKey(keys, event)) {
        return;
      }

      if (requiresCmd) {
        if (!keyboard.isCmd(event)) {
          return;
        }
      } else if (keyboard.hasModifier(event)) {
        return;
      }

      editorActions.trigger(action, event);

      return true;
    });
  });

};