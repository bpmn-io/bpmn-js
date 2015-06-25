'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function CreateRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CreateRules.$inject = [ 'eventBus' ];

inherits(CreateRules, RuleProvider);

module.exports = CreateRules;


CreateRules.prototype.init = function() {
  this.addRule('shape.create', function(context) {

    var target = context.target;

    if (/child/.test(target.id)) {
      return 'attach';
    }

    if (/parent/.test(target.id) || context.source) {
      return true;
    }

    return false;
  });
};
