'use strict';

var inherits = require('inherits');

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');

function ExampleRuleProvider(eventBus) {
  RuleProvider.call(this, eventBus);
}

ExampleRuleProvider.$inject = [ 'eventBus' ];

inherits(ExampleRuleProvider, RuleProvider);

module.exports = ExampleRuleProvider;

ExampleRuleProvider.prototype.init = function() {
  this.addRule('shape.create', function(context) {
    const target = context.target,
          shape = context.shape;

    return target.parent === shape.target;
  });

  this.addRule('connection.create', function(context) {
    const source = context.source,
          target = context.target;

    return source.parent === target.parent;
  });
};