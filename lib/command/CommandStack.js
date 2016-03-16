'use strict';

var unique = require('lodash/array/unique'),
    isArray = require('lodash/lang/isArray'),
    assign = require('lodash/object/assign');

var InternalEvent = require('../core/EventBus').Event;


/**
 * A service that offers un- and redoable execution of commands.
 *
 * The command stack is responsible for executing modeling actions
 * in a un- and redoable manner. To do this it delegates the actual
 * command execution to {@link CommandHandler}s.
 *
 * Command handlers provide {@link CommandHandler#execute(ctx)} and
 * {@link CommandHandler#revert(ctx)} methods to un- and redo a command
 * identified by a command context.
 *
 *
 * ## Life-Cycle events
 *
 * In the process the command stack fires a number of life-cycle events
 * that other components to participate in the command execution.
 *
 *    * preExecute
 *    * preExecuted
 *    * execute
 *    * executed
 *    * postExecute
 *    * postExecuted
 *    * revert
 *    * reverted
 *
 * A special event is used for validating, whether a command can be
 * performed prior to its execution.
 *
 *    * canExecute
 *
 * Each of the events is fired as `commandStack.{eventName}` and
 * `commandStack.{commandName}.{eventName}`, respectively. This gives
 * components fine grained control on where to hook into.
 *
 * The event object fired transports `command`, the name of the
 * command and `context`, the command context.
 *
 *
 * ## Creating Command Handlers
 *
 * Command handlers should provide the {@link CommandHandler#execute(ctx)}
 * and {@link CommandHandler#revert(ctx)} methods to implement
 * redoing and undoing of a command. They must ensure undo is performed
 * properly in order not to break the undo chain.
 *
 * Command handlers may execute other modeling operations (and thus
 * commands) in their `preExecute` and `postExecute` phases. The command
 * stack will properly group all commands together into a logical unit
 * that may be re- and undone atomically.
 *
 * Command handlers must not execute other commands from within their
 * core implementation (`execute`, `revert`).
 *
 *
 * ## Change Tracking
 *
 * During the execution of the CommandStack it will keep track of all
 * elements that have been touched during the command's execution.
 *
 * At the end of the CommandStack execution it will notify interested
 * components via an 'elements.changed' event with all the dirty
 * elements.
 *
 * The event can be picked up by components that are interested in the fact
 * that elements have been changed. One use case for this is updating
 * their graphical representation after moving / resizing or deletion.
 *
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
function CommandStack(eventBus, injector) {

  /**
   * A map of all registered command handlers.
   *
   * @type {Object}
   */
  this._handlerMap = {};

  /**
   * A stack containing all re/undoable actions on the diagram
   *
   * @type {Array<Object>}
   */
  this._stack = [];

  /**
   * The current index on the stack
   *
   * @type {Number}
   */
  this._stackIdx = -1;

  /**
   * Current active commandStack execution
   *
   * @type {Object}
   */
  this._currentExecution = {
    actions: [],
    dirty: []
  };


  this._injector = injector;
  this._eventBus = eventBus;

  this._uid = 1;

  eventBus.on([ 'diagram.destroy', 'diagram.clear' ], this.clear, this);
}

CommandStack.$inject = [ 'eventBus', 'injector' ];

module.exports = CommandStack;


/**
 * Execute a command
 *
 * @param {String} command the command to execute
 * @param {Object} context the environment to execute the command in
 */
CommandStack.prototype.execute = function(command, context) {
  if (!command) {
    throw new Error('command required');
  }

  var action = { command: command, context: context };

  this._pushAction(action);
  this._internalExecute(action);
  this._popAction(action);
};


/**
 * Ask whether a given command can be executed.
 *
 * Implementors may hook into the mechanism on two ways:
 *
 *   * in event listeners:
 *
 *     Users may prevent the execution via an event listener.
 *     It must prevent the default action for `commandStack.(<command>.)canExecute` events.
 *
 *   * in command handlers:
 *
 *     If the method {@link CommandHandler#canExecute} is implemented in a handler
 *     it will be called to figure out whether the execution is allowed.
 *
 * @param  {String} command the command to execute
 * @param  {Object} context the environment to execute the command in
 *
 * @return {Boolean} true if the command can be executed
 */
CommandStack.prototype.canExecute = function(command, context) {

  var action = { command: command, context: context };

  var handler = this._getHandler(command);

  if (!handler) {
    return false;
  }

  var result = this._fire(command, 'canExecute', action);

  // handler#canExecute will only be called if no listener
  // decided on a result already
  if (result === undefined && handler.canExecute) {
    result = handler.canExecute(context);
  }

  return result;
};


/**
 * Clear the command stack, erasing all undo / redo history
 */
CommandStack.prototype.clear = function() {
  this._stack.length = 0;
  this._stackIdx = -1;

  this._fire('changed');
};


/**
 * Undo last command(s)
 */
CommandStack.prototype.undo = function() {
  var action = this._getUndoAction(),
      next;

  if (action) {
    this._pushAction(action);

    while (action) {
      this._internalUndo(action);
      next = this._getUndoAction();

      if (!next || next.id !== action.id) {
        break;
      }

      action = next;
    }

    this._popAction();
  }
};


/**
 * Redo last command(s)
 */
CommandStack.prototype.redo = function() {
  var action = this._getRedoAction(),
      next;

  if (action) {
    this._pushAction(action);

    while (action) {
      this._internalExecute(action, true);
      next = this._getRedoAction();

      if (!next || next.id !== action.id) {
        break;
      }

      action = next;
    }

    this._popAction();
  }
};


/**
 * Register a handler instance with the command stack
 *
 * @param {String} command
 * @param {CommandHandler} handler
 */
CommandStack.prototype.register = function(command, handler) {
  this._setHandler(command, handler);
};


/**
 * Register a handler type with the command stack
 * by instantiating it and injecting its dependencies.
 *
 * @param {String} command
 * @param {Function} a constructor for a {@link CommandHandler}
 */
CommandStack.prototype.registerHandler = function(command, handlerCls) {

  if (!command || !handlerCls) {
    throw new Error('command and handlerCls must be defined');
  }

  var handler = this._injector.instantiate(handlerCls);
  this.register(command, handler);
};

CommandStack.prototype.canUndo = function() {
  return !!this._getUndoAction();
};

CommandStack.prototype.canRedo = function() {
  return !!this._getRedoAction();
};

////// stack access  //////////////////////////////////////

CommandStack.prototype._getRedoAction = function() {
  return this._stack[this._stackIdx + 1];
};


CommandStack.prototype._getUndoAction = function() {
  return this._stack[this._stackIdx];
};


////// internal functionality /////////////////////////////

CommandStack.prototype._internalUndo = function(action) {
  var command = action.command,
      context = action.context;

  var handler = this._getHandler(command);

  this._fire(command, 'revert', action);

  if (handler.revert) {
    this._markDirty(handler.revert(context));
  }

  this._revertedAction(action);

  this._fire(command, 'reverted', action);
};


CommandStack.prototype._fire = function(command, qualifier, event) {
  if (arguments.length < 3) {
    event = qualifier;
    qualifier = null;
  }

  var names = qualifier ? [ command + '.' + qualifier, qualifier ] : [ command ],
      i, name, result;

  event = assign(new InternalEvent(), event);

  for (i = 0; !!(name = names[i]); i++) {
    result = this._eventBus.fire('commandStack.' + name, event);

    if (event.cancelBubble) {
      break;
    }
  }

  return result;
};

CommandStack.prototype._createId = function() {
  return this._uid++;
};


CommandStack.prototype._internalExecute = function(action, redo) {
  var command = action.command,
      context = action.context;

  var handler = this._getHandler(command);

  if (!handler) {
    throw new Error('no command handler registered for <' + command + '>');
  }

  this._pushAction(action);

  if (!redo) {
    this._fire(command, 'preExecute', action);

    if (handler.preExecute) {
      handler.preExecute(context);
    }

    this._fire(command, 'preExecuted', action);
  }

  this._fire(command, 'execute', action);

  if (handler.execute) {
    // actual execute + mark return results as dirty
    this._markDirty(handler.execute(context));
  }

  // log to stack
  this._executedAction(action, redo);

  this._fire(command, 'executed', action);

  if (!redo) {
    this._fire(command, 'postExecute', action);

    if (handler.postExecute) {
      handler.postExecute(context);
    }

    this._fire(command, 'postExecuted', action);
  }

  this._popAction(action);
};


CommandStack.prototype._pushAction = function(action) {

  var execution = this._currentExecution,
      actions = execution.actions;

  var baseAction = actions[0];

  if (!action.id) {
    action.id = (baseAction && baseAction.id) || this._createId();
  }

  actions.push(action);
};


CommandStack.prototype._popAction = function() {
  var execution = this._currentExecution,
      actions = execution.actions,
      dirty = execution.dirty;

  actions.pop();

  if (!actions.length) {
    this._eventBus.fire('elements.changed', { elements: unique(dirty) });

    dirty.length = 0;

    this._fire('changed');
  }
};


CommandStack.prototype._markDirty = function(elements) {
  var execution = this._currentExecution;

  if (!elements) {
    return;
  }

  elements = isArray(elements) ? elements : [ elements ];

  execution.dirty = execution.dirty.concat(elements);
};


CommandStack.prototype._executedAction = function(action, redo) {
  var stackIdx = ++this._stackIdx;

  if (!redo) {
    this._stack.splice(stackIdx, this._stack.length, action);
  }
};


CommandStack.prototype._revertedAction = function(action) {
  this._stackIdx--;
};


CommandStack.prototype._getHandler = function(command) {
  return this._handlerMap[command];
};

CommandStack.prototype._setHandler = function(command, handler) {
  if (!command || !handler) {
    throw new Error('command and handler required');
  }

  if (this._handlerMap[command]) {
    throw new Error('overriding handler for command <' + command + '>');
  }

  this._handlerMap[command] = handler;
};
