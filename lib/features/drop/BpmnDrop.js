'use strict';

var _ = require('lodash');



function BpmnDrop(drop, openSequenceflowHandler, updateSequenceFlowParentHandler) {

  var actions = {
    'updateSequenceFlowParent': updateSequenceFlowParentHandler,
    'removeOpenSequenceflow': openSequenceflowHandler
  };

  var self = this;

  this._drop = drop;

  _.forEach(actions, function(action, key) {
    self._drop.registerAfterDropAction(key, action.execute);
  });
}

BpmnDrop.$inject = [ 'drop', 'openSequenceflowHandler', 'updateSequenceFlowParentHandler' ];

module.exports = BpmnDrop;
