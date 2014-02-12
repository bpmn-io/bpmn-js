_ = require('../util/underscore');

/**
 * @description TODO
 */
function Command() {
  'use strict';

  var commandListenersMap = {};

  function registerCommand(id, fn) {
    checkId(id);
    addCommandListener(id, fn);
  }

  function unregisterCommand(id) {
    //TODO
  }

  function getCommandList() {
    return commandListenersMap;
  }

  /**
   * Execute all registered actions for this command id
   * @param id
   * @param params
   */
  function doCommand(id, params) {
    var commandListeners = getCommandListener(id);
    _.forEach(commandListeners, function(commandListener) {
      commandListener(params);
    });
  }

  function undoCommand() {}

  var getCommandListener = function getCommandListener(id) {
    return commandListenersMap[id];
  };

  var addCommandListener = function addCommandListener(id, fn) {
    var commandListeners = getCommandListener(id);
    if(commandListeners) {
      commandListenersMap.push(fn);
    } else {
      commandListenersMap[id] = [];
      commandListenersMap[id].push(fn);
    }
  };

  function checkId(id) {
    if (!id) {
      throw {
        message: 'No ID specified.'
      };
    }
  }

  return {
    registerCommand: registerCommand,
    unregisterCommand: unregisterCommand,
    getCommandList: getCommandList,
    doCommand: doCommand,
    undoCommand: undoCommand
  };
}

module.exports = Command;
