'use strict';

var _ = require('lodash');

var DropAction     = require('./DropRules'),
    ConnectHandler = require('./ConnectRules');


function BpmnRules(rules) {
  rules.registerRule('drop', 'validateSubProcess', DropAction.validateSubProcess);
}

BpmnRules.$inject = [ 'rules' ];

module.exports = BpmnRules;
