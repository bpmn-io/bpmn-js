'use strict';

var _ = require('lodash');


/**
 * @namespace djs
 */

/**
 * @class
 *
 * This service offer an action history for the application.
 * So that the diagram can support undo/redo. All actions applied
 * to the diagram must be invoked through this Service.
 *
 * @param {Injector} injector
 * @param {EventBus} events
 */
function CommandStack(injector, events) {

  /**
   *
   * @type {Object} Key is the command id and value is a list of registered handler methods}
   */
  var handlerMap = this._handlerMap = {};

  /**
   * The stack containing all re/undoable actions on the diagram
   * @type {Array<Object>}
   */
  var stack = [];

  /**
   * The current index on the stack
   * @type {Number}
   */
  var stackIdx = -1;

  this._injector = injector;

  function redoAction() {
    return stack[stackIdx + 1];
  }

  function undoAction() {
    return stack[stackIdx];
  }

  /**
   * Execute all registered actions for this command id
   *
   * @param {String} id of the action
   * @param {Object} ctx is a parameter object for the executed action
   */
  function execute(id, ctx) {
    var action = { id: id, ctx: ctx };

    internalExecute(action);
  }

  /**
   * Execute all registered actions for this command id
   *
   * @param {String} id of the action
   * @param {Object} ctx is a parameter object for the executed action
   * @param {Boolean} saveRedoStack if true the redo stack is not reset.
   *                  This must be set when an redo action is applied.
   */
  function internalExecute(action) {
    var id = action.id,
        ctx = action.ctx;

    if (!action.id) {
      throw new Error('action has no id');
    }

    events.fire('commandStack.execute', { id: id });

    var handlers = getHandlers(id);

    if (!(handlers && handlers.length)) {
      console.warn('no command handler registered for ', id);
    }

    var executedHandlers = [];

    _.forEach(handlers, function(handler) {
      if (handler.execute(ctx)) {
        executedHandlers.push(handler);
      } else {
        // TODO(nre): handle revert case, i.e. the situation that one of a number of handlers fail
      }
    });

    executeFinished(action);
  }

  function executeFinished(action) {
    if (redoAction() !== action) {
      stack.splice(stackIdx + 1, stack.length, action);
    }

    stackIdx++;

    events.fire('commandStack.changed');
  }


  function undo() {

    var action = undoAction();
    if (!action) {
      return false;
    }

    events.fire('commandStack.revert', { id: action.id });

    var handlers = getHandlers(action.id);
    _.forEach(handlers, function(handler) {
      handler.revert(action.ctx);
    });

    revertFinished(action);
  }

  function revertFinished(action) {
    stackIdx--;

    events.fire('commandStack.changed');
  }

  function redo() {

    var action = redoAction();
    if (action) {
      internalExecute(action);
    }

    return action;
  }

  function getHandlers(id) {
    if (id) {
      return handlerMap[id];
    } else {
      return handlerMap;
    }
  }

  function getStack() {
    return stack;
  }

  function getStackIndex() {
    return stackIdx;
  }

  function clear() {
    stack.length = 0;
    stackIdx = -1;

    events.fire('commandStack.changed');
  }

  this.execute = execute;
  this.undo = undo;
  this.redo = redo;
  this.clear = clear;
  this.getStack = getStack;
  this.getStackIndex = getStackIndex;
  this.getHandlers = getHandlers;
}

CommandStack.$inject = [ 'injector', 'eventBus' ];

module.exports = CommandStack;



////// registration ////////////////////////////////////////

CommandStack.prototype._addHandler = function(command, handler) {
  if (!command) {
    throw new Error('no command id specified');
  }

  (this._handlerMap[command] = this._handlerMap[command] || []).push(handler);
};

/**
 * Register a handler instance with the command stack
 *
 * @param  {String} command
 * @param  {Function} handler
 */
CommandStack.prototype.register = function(command, handler) {
  this._addHandler(command, handler);
};

/**
 * Register a handler type with the command stack
 * by instantiating it and injecting its dependencies.
 *
 * @param  {String} command
 * @param  {Function} handlerCls
 */
CommandStack.prototype.registerHandler = function(command, handlerCls) {

  if (!command || !handlerCls) {
    throw new Error('command and handlerCls must be defined');
  }

  var handler = this._injector.instantiate(handlerCls);
  this.register(command, handler);
};