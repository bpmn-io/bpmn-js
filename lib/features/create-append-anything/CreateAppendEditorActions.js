import { assign } from 'min-dash';

/**
 * Registers and executes BPMN specific editor actions.
 *
 * @param {Injector} injector
 */
export default function CreateAppendEditorActions(injector) {
  this._injector = injector;

  this.registerActions();
}

CreateAppendEditorActions.$inject = [
  'injector'
];

/**
 * Register actions.
 *
 * @param {Injector} injector
 */
CreateAppendEditorActions.prototype.registerActions = function() {
  var editorActions = this._injector.get('editorActions', false);
  var selection = this._injector.get('selection', false);
  var contextPad = this._injector.get('contextPad', false);

  const actions = {};

  // append
  if (selection && contextPad) {
    assign(actions, {
      'appendElement': function(event) {
        contextPad.triggerEntry('append', 'click', event);
      } }
    );
  }

  editorActions && editorActions.register(actions);

};
