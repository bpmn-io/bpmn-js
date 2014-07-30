'use strict';

var _ = require('lodash');


/**
 * @namespace djs.command
 */

/**
 * A service that offers re- and undoable execution of commands.
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
}

CommandStack.$inject = [ 'eventBus', 'injector' ];

module.exports = CommandStack;


/**
 * Execute a command
 *
 * @param {String} command the command to execute
 * @param {Object} ctx is a parameter object for the executed action
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
 * @method djs.command.CommandStack#register
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
 * @method djs.command.CommandStack#registerHandler
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


////// internal functionality /////////////////////////////


CommandStack.prototype._internalUndo = function(action) {
  var command = action.command,
      context = action.context;

  var handler = this._getHandler(command);

  this._fire([ command + '.revert', 'revert' ], action);

  this._markDirty(handler.revert(context));

  this._revertedAction(action);

  this._fire([ command + '.reverted', 'reverted' ], action);
};


CommandStack.prototype._fire = function(names, event) {

  names = _.isArray(names) ? names : [ names ];

  event = _.clone(event);

  _.forEach(names, function(n) {
    this._eventBus.fire('commandStack.' + n, event);
  }, this);
};

CommandStack.prototype._createId = function() {
  return this._uid++;
};


////// stack access  //////////////////////////////////////

CommandStack.prototype._getRedoAction = function() {
  return this._stack[this._stackIdx + 1];
};


CommandStack.prototype._getUndoAction = function() {
  return this._stack[this._stackIdx];
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
    this._fire([ command + '.preExecute', 'preExecute' ], action);

    if (handler.preExecute) {
      handler.preExecute(context);
    }
  }

  this._fire([ command + '.execute', 'execute' ], action);

  // execute
  this._markDirty(handler.execute(context));

  // log to stack
  this._executedAction(action, redo);

  this._fire([ command + '.executed', 'executed' ], action);

  if (!redo) {
    this._fire([ command + '.postExecute', 'postExecute' ], action);

    if (handler.postExecute) {
      handler.postExecute(context);
    }
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

    // cleanup execution
    _.forEach(_.unique(dirty), function(e) {
      this._eventBus.fire('element.changed', { element: e });
    }, this);

    dirty.length = 0;

    this._fire('changed');
  }
};


CommandStack.prototype._markDirty = function(elements) {
  var execution = this._currentExecution;

  if (!elements) {
    return;
  }

  elements = _.isArray(elements) ? elements : [ elements ];

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