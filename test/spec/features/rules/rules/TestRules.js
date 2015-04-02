'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function ResizeRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ResizeRules.$inject = [ 'eventBus' ];

inherits(ResizeRules, RuleProvider);

module.exports = ResizeRules;


ResizeRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {

    var shape = context.shape;

    if (shape.ignoreResize) {
      return null;
    }

    return shape.resizable !== undefined ? shape.resizable : undefined;
  });
};