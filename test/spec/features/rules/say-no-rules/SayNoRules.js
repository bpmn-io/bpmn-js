'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function SayNoRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

SayNoRules.$inject = [ 'eventBus' ];

inherits(SayNoRules, RuleProvider);

module.exports = SayNoRules;


SayNoRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {
    return false;
  });
};