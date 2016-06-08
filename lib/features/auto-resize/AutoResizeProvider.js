var RuleProvider = require('../rules/RuleProvider');

var inherits = require('inherits');

/**
 * This is a base rule provider for the element.autoResize rule.
 */
function AutoResizeProvider(eventBus) {

  RuleProvider.call(this, eventBus);

  var self = this;

  this.addRule('element.autoResize', function(context) {
    return self.canResize(context.elements, context.target);
  });
}

AutoResizeProvider.$inject = [ 'eventBus' ];

inherits(AutoResizeProvider, RuleProvider);

module.exports = AutoResizeProvider;

/**
 * Needs to be implemented by sub classes to allow actual auto resize
 *
 * @param  {Array<djs.model.Shape>} elements
 * @param  {djs.model.Shape} target
 *
 * @return {Boolean}
 */
AutoResizeProvider.prototype.canResize = function(elements, target) {
  return false;
};