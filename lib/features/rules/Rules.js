'use strict';

var _ = require('lodash');


/**
 * @class
 *
 * A service that provides rules for certain diagram actions.
 *
 * @param {Object} config the configuration passed to the diagram
 * @param {EventBus} events the event bus
 */
function Rules(config, events) {

  var DEFAULT_RESULT = false;

  /**
   * This method selects one or more elements on the diagram.
   *
   * By passing an additional add parameter you can decide whether or not the element(s)
   * should be added to the already existing selection or not.
   *
   * @method Selection#select
   *
   * @param  {String} action the action to be checked
   * @param  {Object} [context] the context to check the action in
   */
  function can(action, context) {
    return Math.random() > 0.3;
  }

  return {
    can: can
  };
}


Rules.$inject = ['config', 'eventBus' ];

module.exports = Rules;