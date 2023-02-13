import inherits from 'inherits-browser';

import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings';


/**
 * BPMN 2.0 specific keyboard bindings.
 *
 * @param {Injector} injector
 */
export default function CreateAppendKeyboardBindings(injector) {

  this._injector = injector;
  this._keyboard = this._injector.get('keyboard', false);
  this._editorActions = this._injector.get('editorActions', false);

  if (this._keyboard) {
    this._injector.invoke(KeyboardBindings, this);
  }
}

inherits(CreateAppendKeyboardBindings, KeyboardBindings);

CreateAppendKeyboardBindings.$inject = [
  'injector'
];


/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
CreateAppendKeyboardBindings.prototype.registerBindings = function() {

  var keyboard = this._keyboard;
  var editorActions = this._editorActions;

  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions);

  /**
   * Add keyboard binding if respective editor action
   * is registered.
   *
   * @param {string} action name
   * @param {Function} fn that implements the key binding
   */
  function addListener(action, fn) {

    if (editorActions && editorActions.isRegistered(action)) {
      keyboard && keyboard.addListener(fn);
    }
  }

  // activate append/create element
  // A
  addListener('appendElement', function(context) {

    var event = context.keyEvent;

    if (keyboard && keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard && keyboard.isKey([ 'a', 'A' ], event)) {

      editorActions && editorActions.trigger('appendElement', event);
      return true;
    }
  });

  // N
  addListener('createElement', function(context) {

    var event = context.keyEvent;

    if (keyboard && keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard && keyboard.isKey([ 'n', 'N' ], event)) {
      editorActions && editorActions.trigger('createElement', event);

      return true;
    }
  });

};