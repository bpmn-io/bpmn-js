var _ = require('../util/underscore');

/**
 * @class Events
 */
function Events() {
  
  var listenerMap = {};

  function getListeners(name) {
    var listeners = listenerMap[name];

    if (!listeners) {
      listeners = listenerMap[name] = [];
    }

    return listeners;
  }

  function extendEvent(event, type) {
    
    var propagationStopped,
        defaultPrevented;

    _.extend(event, {
      type: type,

      stopPropagation: function() {
        propagationStopped = true;
      },
      preventDefault: function() {
        defaultPrevented = true;
      },

      isPropagationStopped: function() {
        return !!propagationStopped;
      },

      isDefaultPrevented: function() {
        return !!defaultPrevented;
      }
    });

    return event;
  }

  /**
   * @method
   * 
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with {Event}, ... additionalArguments
   * that have been passed to the evented element.
   * 
   * @param {String} event
   * @param {Function} callback
   */
  function on(event, callback) {
    var listeners = getListeners(event);
    listeners.push(callback);
  }

  /**
   * @method
   * 
   * Register an event listener that is executed only once.
   *
   * @param event
   * @param callback
   *
   * @see #on(event,callback)
   */
  function once(event, callback) {

    var self = this;

    var wrappedCallback = function() {

      var eventType = arguments[0].type;

      self.off(eventType, wrappedCallback);
    };

    this.on(event, wrappedCallback);
  }

  /**
   * @method
   * 
   * Removes event listeners by event and optionally callback.
   *
   * @param {String} event
   * @param {Function} callback (optional)
   */
  function off(event, callback) {
    var listeners, idx;

    listeners = getListeners(event);

    if (callback) {
      idx = listeners.indexOf(callback);

      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    } else {
      listeners.length = 0;
    }
  }

  /**
   * @method
   * 
   * Fires a named event.
   *
   * @param {String} name (optional) the optional event name
   * @param {Object} event the event object
   * 
   * @param {...} ... additionalArgs to be passed to the callback functions
   */
  function fire() {
    var event, eventType,
        listeners, i, l,
        args;

    args = Array.prototype.slice.call(arguments);

    eventType = args[0];

    if (_.isObject(eventType)) {
      event = eventType;

      // parse type from event
      eventType = event.type;
    } else {
      // remove name parameter
      args.shift();

      event = args[0] || {};
    }

    listeners = getListeners(eventType);
    event = extendEvent(event, eventType);

    for (i = 0, l; !!(l = listeners[i]); i++) {
      if (event.isPropagationStopped()) {
        break;
      }

      l.apply(this, args);
    }
  }

  return {
    on: on,
    once: once,
    off: off,
    fire: fire
  };
}

module.exports = Events;