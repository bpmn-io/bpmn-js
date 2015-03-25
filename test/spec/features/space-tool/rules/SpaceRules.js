'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function SpaceRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

SpaceRules.$inject = [ 'eventBus' ];

inherits(SpaceRules, RuleProvider);

module.exports = SpaceRules;


SpaceRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {
    return context.shape.children.length > 0;
  });
};