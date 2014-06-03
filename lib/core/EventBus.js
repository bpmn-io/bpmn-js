var diagramModule = require('../di').defaultModule;

var _ = require('lodash');

/**
 * @global
 * @type {Object}
 * @static
 */
var EventPriority = {
  standard: 1000,
  overwrite: 10000
};

/**
 * @class
 *
 * A general purpose event bus
 */
function EventBus() {
  'use strict';

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
        this.propagationStopped = true;
      },
      preventDefault: function() {
        this.defaultPrevented = true;
      },

      isPropagationStopped: function() {
        return !!this.propagationStopped;
      },

      isDefaultPrevented: function() {
        return !!this.defaultPrevented;
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
   * @param {Number} Set priority to influence the execution order of the callbacks.
   * The default priority is 1000. It should only set to higher values (> {@link EventPriority#overwrite}) if
   * there is real need for a changed execution priority.
   */
  function on(event, callback, priority) {
    if(priority && !_.isNumber(priority)) {
      console.error('Priority needs to be a number');
      priority = EventPriority.standard;
    }
    if(!priority) {
      priority = EventPriority.standard;
    }
    var listeners = getListeners(event);
    addEventToArray(listeners, callback, priority);
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
      callback.apply(this, arguments);
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
      _.forEach(listeners, function(listener) {
        if(listener.callback === callback) {
          idx = listeners.indexOf(listener);
        }
      });

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
      event.type = eventType;
      if(args.length === 0) {
        args.push(event);
      }
    }

    listeners = getListeners(eventType);
    event = extendEvent(event, eventType);

    for (i = 0, l; !!(l = listeners[i]); i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      l.callback.apply(this, args);
    }
  }

  function addEventToArray(array, callback, priority) {

    array.push({
      priority: priority,
      callback: callback
    });

    array.sort(function(a, b) {
      if(a.priority < b.priority) {
        return 1;
      } else if (a.priority > b.priority) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  this.on = on;
  this.once = once;
  this.off = off;
  this.fire = fire;
}

diagramModule.type('eventBus', EventBus);

module.exports = EventBus;