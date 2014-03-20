var components = require('../di').defaultModule;

var _ = require('lodash');

/**
 * @class
 * 
 * A general purpose event bus
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
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to the evented element.
   *
   * @method Events#on
   * 
   * @param {String} event
   * @param {Function} callback
   */
  function on(event, callback) {
    var listeners = getListeners(event);
    listeners.push(callback);
  }

  /**
   * Register an event listener that is executed only once.
   * 
   * @method Events#once
   *
   * @param {String} event the event name to register for
   * @param {Function} callback the callback to execute
   *
   * @see Events#on
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
   * Removes event listeners by event and callback.
   * 
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @method Events#off
   * 
   * @param {String} event
   * @param {Function} [callback]
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
   * Fires a named event.
   * 
   * @method Events#fire
   *
   * @example
   *
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   * 
   * @param {String} [name] the optional event name
   * @param {Object} [event] the event object
   * @param {...Object} additional arguments to be passed to the callback functions
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

components.type('events', Events);

module.exports = Events;