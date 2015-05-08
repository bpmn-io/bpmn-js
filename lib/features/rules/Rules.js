'use strict';

/**
 * A service that provides rules for certain diagram actions.
 *
 * @param {CommandStack} commandStack
 */
function Rules(commandStack) {
  this._commandStack = commandStack;
}

Rules.$inject = [ 'commandStack' ];

module.exports = Rules;


/**
 * This method can be queried to ask whether certain modeling actions
 * are allowed or not.
 *
 * @param  {String} action the action to be checked
 * @param  {Object} [context] the context to check the action in
 *
 * @return {Boolean} returns true, false or null depending on whether the
 *                   operation is allowed, not allowed or should be ignored.
 */
Rules.prototype.allowed = function(action, context) {
  var allowed = this._commandStack.canExecute(action, context);

  // map undefined to true, i.e. no rules
  return allowed === undefined ? true : allowed;
};