'use strict';

/**
 * A component that handles language switching in a unified way.
 *
 * @param {EventBus} eventBus
 */
function I18N(eventBus) {

  /**
   * Inform components that the language changed.
   *
   * Emit a `i18n.changed` event for others to hook into, too.
   */
  this.changed = function changed() {
    eventBus.fire('i18n.changed');
  };
}

I18N.$inject = [ 'eventBus' ];

module.exports = I18N;