
var Diagram = require('../../Diagram'),
    _ = require('../../util/underscore');

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
 */
function CommandStack() {
  'use strict';

  /**
   *
   * @type {Object} Key is the command id and value is a list of registered handler methods}
   */
  var commandListenersMap = {};
  /**
   *
   * @type {Array} A stack containing the last operations on the diagram}
   */
  var actionStack = [];
  /**
   *
   * @type {Array} A stack containing the last operations on the diagram that were undone}
   */
  var redoStack = [];

  function registerCommand(id, handler) {
    checkId(id);
    addCommandListener(id, handler);
  }

  function commandList() {
    return commandListenersMap;
  }

  /**
   * Execute all registered actions for this command id
   *
   * @param {String} id of the action
   * @param {Object} ctx is a parameter object for the executed action
   */
  function applyAction(id, ctx) {
    internalApplyAction(id, ctx, false);
  }

  /**
   * Execute all registered actions for this command id
   *
   * @param {String} id of the action
   * @param {Object} ctx is a parameter object for the executed action
   * @param {Boolean} saveRedoStack if true the redo stack is not reset.
   *                  This must be set when an redo action is applied.
   */
  function internalApplyAction(id, ctx, saveRedoStack) {
    var commandListeners = getCommandListener(id);
    _.forEach(commandListeners, function(commandListener) {
      if(commandListener.do(ctx)) {
        pushAction(id, ctx);
        if(!saveRedoStack) {
          // A new action invalidates all actions in the redoStack.
          _.emptyArray(redoStack);
        }
      }
    });
  }

  function undoAction() {
    var lastAction = popAction();
    if(!lastAction) {
      return false;
    }
    var commandListeners = getCommandListener(lastAction.id);
    _.forEach(commandListeners, function(commandListener) {
      commandListener.undo(lastAction.param);
    });
    pushActionToRedoStack(lastAction);
  }

  var redoAction = function redoAction() {
    var actionToRedo = popFromRedoStack();
    if(actionToRedo) {
      internalApplyAction(actionToRedo.id, actionToRedo.param, true);
    }
    return actionToRedo;
  };

  var getCommandListener = function getCommandListener(id) {
    return commandListenersMap[id];
  };

  var addCommandListener = function addCommandListener(id, handler) {
    var commandListeners = getCommandListener(id);
    if(commandListeners) {
      commandListenersMap.push(handler);
    } else {
      commandListenersMap[id] = [];
      commandListenersMap[id].push(handler);
    }
  };

  var checkId = function checkId(id) {
    if (!id) {
      throw {
        message: 'No ID specified.'
      };
    }
  };

  var pushAction = function pushAction(id, param) {
    actionStack.push({'id': id,
                      'param': param
                     });
  };

  var popAction = function popAction() {
    return actionStack.pop();
  };

  var pushActionToRedoStack = function pushActionToRedoStack(action) {
    redoStack.push(action);
  };

  var popFromRedoStack = function popFromRedoStack() {
    return redoStack.pop();
  };

  var getActionStack = function getActionStack() {
    return actionStack;
  };

  var getRedoStack = function getRedoStack() {
    return redoStack;
  };

  var clearActionStack = function clearActionStack() {
    while (actionStack.length > 0) {
      actionStack.pop();
    }
  };

  return {
    register: registerCommand,
    execute: applyAction,
    undo: undoAction,
    redo: redoAction,
    getCommandList: commandList,
    actionStack: getActionStack,
    redoStack: getRedoStack,
    clearStack: clearActionStack
  };
}

module.exports = CommandStack;

Diagram.plugin('commandStack', CommandStack);
