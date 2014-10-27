'use strict';

var _ = require('lodash');

var connectRules = require('./StandardConnectRules');
var dropRules = require('./StandardDropRules');

/**
 * @class
 *
 * A service that provides rules for certain diagram actions.
 *
 * @param {Object} config the configuration passed to the diagram
 * @param {EventBus} events the event bus
 */
function Rules(config, events) {

  var DEFAULT_RESULT = false;

  this._rules = {
    'connect': {
      'canConnect': connectRules.canConnect
    },
    'drop': {
      'hasTarget': dropRules.hasTarget,
      'preventChild': dropRules.preventChild
    }
  };
}


Rules.$inject = ['config', 'eventBus' ];

module.exports = Rules;

/**
 * This method selects one or more elements on the diagram.
 *
 * By passing an additional add parameter you can decide whether or not the element(s)
 * should be added to the already existing selection or not.
 *
 * @method Selection#select
 *
 * @param  {String} action the action to be checked
 * @param  {Object} [context] the context to check the action in
 */
Rules.prototype.can = function(action, context) {

  var rules = this._rules[action];

  var allowed = _.every(rules, function(rule) {
    return rule(context);
  });

  return allowed;
};


Rules.prototype.registerRule = function(actionName, ruleName, rule) {

  var rules = this._rules;

  var action = this._rules[actionName] || {};

  action[ruleName] = rule;

  this._rules[actionName] = action;
};
