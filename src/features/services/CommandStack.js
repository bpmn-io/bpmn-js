
var Diagram = require('../../Diagram'),
    _ = require('../../util/underscore');

/**
 * @namespace djs
 */

/**
 * @class
 *
 * The command registry.
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

  function registerCommand(id, handler) {
    checkId(id);
    addCommandListener(id, handler);
  }

  function commandList() {
    return commandListenersMap;
  }

  /**
   * Execute all registered actions for this command id
   * @param id
   * @param params
   */
  function applyAction(id, ctx) {
    var commandListeners = getCommandListener(id);
    _.forEach(commandListeners, function(commandListener) {
      if(commandListener.do(ctx)) {
        pushAction(id, ctx);
      }
    });
  }

  function undoAction() {
    var lastAction = popAction();
    if(!lastAction) {
      console.log('false  ' + false);
      return false;
    }
    var commandListeners = getCommandListener(lastAction.id);
    _.forEach(commandListeners, function(commandListener) {
        commandListener.undo(lastAction.param);
    });
  }

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

  var getActionStack = function getActionStack() {
    return actionStack;
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
    redo: undefined,
    getCommandList: commandList,
    actionStack: getActionStack,
    clearStack: clearActionStack
  };
}

module.exports = CommandStack;

Diagram.plugin('commandStack', CommandStack);
