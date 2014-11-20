var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function ResizeRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ResizeRules.$inject = ['eventBus'];

module.exports = ResizeRules;

ResizeRules.prototype = Object.create(RuleProvider.prototype);


ResizeRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {

    var shape = context.shape;

    if (!context.newBounds) {
      // check general resizability
      if (!shape.resizable) {
        return false;
      }
    } else {
      // element must have minimum size of 10*10 points
      return context.newBounds.width > 10 && context.newBounds.height > 10;
    }
  });
};