'use strict';

var inherits = require('inherits');

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');

function customRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

customRules.$inject = ['eventBus'];

inherits(customRules, RuleProvider);

module.exports = customRules;


customRules.prototype.init = function() {};

customRules.prototype.add = function (rules) {
  for (var key in rules) {
    if (rules.hasOwnProperty(key) && typeof rules[key] === 'function') {
      this.addRule(key, rules[key]);
    }
  }
};
