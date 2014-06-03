'use strict';

var diagramModule = require('../di').defaultModule;

var _ = require('lodash');


require('./EventBus');

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
  var handlerMap = {};

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

  function addHandler(id, handler) {
    assertValidId(id);

    var handlers = handlerMap[id];
    if (!handlers) {
      handlerMap[id] = handlers = [];
    }

    handlers.push(handler);
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
  }


  ////// registration ////////////////////////////////////////

  function assertValidId(id) {
    if (!id) {
      throw new Error('no id specified');
    }
  }

  function register(id, handler) {
    addHandler(id, handler);
  }

  function registerHandler(command, handlerCls) {

    if (!command || !handlerCls) {
      throw new Error('command and handlerCls must be defined');
    }

    var handler = injector.instantiate(handlerCls);
    register(command, handler);
  }

  return {
    execute: execute,
    undo: undo,
    redo: redo,
    clear: clear,
    getStack: getStack,
    getStackIndex: getStackIndex,
    getHandlers: getHandlers,
    registerHandler: registerHandler,
    register: register
  };
}

diagramModule.type('commandStack', [ 'injector', 'eventBus', CommandStack ]);

module.exports = CommandStack;