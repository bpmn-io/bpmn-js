/**
 * A basic provider that may be extended to implement modeling rules.
 *
 * Extensions should implement the init method to actually add their custom
 * modeling checks. Checks may be added via the #addRule(action, fn) method.
 *
 * @param {EventBus} eventBus
 */
function RuleProvider(eventBus) {
  this._eventBus = eventBus;

  this.init();
}

RuleProvider.$inject = [ 'eventBus' ];

module.exports = RuleProvider;


/**
 * Adds a modeling rule for the given action, implemented through a callback function.
 *
 * The function will receive the modeling specific action context to perform its check.
 * It must return false to disallow the action from happening.
 *
 * @example
 *
 * ResizableRules.prototype.init = function() {
 *
 *   this.addRule('shape.resize', function(context) {
 *
 *     var shape = context.shape;
 *
 *     if (!context.newBounds) {
 *       // check general resizability
 *       if (!shape.resizable) {
 *         return false;
 *       }
 *     } else {
 *       // element must have minimum size of 10*10 points
 *       return context.newBounds.width > 10 && context.newBounds.height > 10;
 *     }
 *   });
 * };
 *
 * @param {String} action the identifier for the modeling action to check
 * @param {Function} fn the callback function that performs the actual check
 */
RuleProvider.prototype.addRule = function(action, fn) {

  // hook into the command stacks modeling checks via the event bus

  this._eventBus.on('commandStack.' + action + '.canExecute', function(event) {

    if (fn(event.context) === false) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
};