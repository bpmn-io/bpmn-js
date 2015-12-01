'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function CustomRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CustomRules.$inject = ['eventBus'];

inherits(CustomRules, RuleProvider);

module.exports = CustomRules;
