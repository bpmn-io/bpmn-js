var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function MoveRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

MoveRules.$inject = ['eventBus'];

module.exports = MoveRules;

MoveRules.prototype = Object.create(RuleProvider.prototype);


MoveRules.prototype.init = function() {

  this.addRule('shapes.move', function(context) {
    var target = context.newParent,
        shapes = context.shapes;

    // check that we do not accidently try to drop elements
    // onto themselves or children of themselves
    while (target) {
      if (shapes.indexOf(target) !== -1) {
        return false;
      }

      target = target.parent;
    }
  });

};