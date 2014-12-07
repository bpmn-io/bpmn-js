'use strict';

var _ = require('lodash');

var DEFAULT_PRIORITY = 1000;

function Event() { }

Event.prototype = {
  stopPropagation: function() {
    this.propagationStopped = true;
  },
  preventDefault: function() {
    this.defaultPrevented = true;
  },
  init: function(data) {
    _.extend(this, data || {});
  }
};


/**
 * A general purpose event bus
 *
 * @class
 */
function EventBus() {
  this._listeners = {};

  // cleanup on destroy

  var self = this;

  this.on('diagram.destroy', function() {
    self._listeners = null;
  });
}

module.exports = EventBus;

module.exports.Event = Event;


/**
 * Register an event listener for events with the given name.
 *
 * The callback will be invoked with `event, ...additionalArguments`
 * that have been passed to {@link EventBus#fire}.
 *
 * Returning false from a listener will prevent the events default action
 * (if any is specified). To stop an event from being processed further in
 * other listeners execute {@link Event#stopPropagation}.
 *
 * @param {String|Array<String>} events
 * @param {Number} [priority=1000] the priority in which this listener is called, larger is higher
 * @param {Function} callback
 */
EventBus.prototype.on = function(events, priority, callback) {

  events = _.isArray(events) ? events : [ events ];

  if (_.isFunction(priority)) {
    callback = priority;
    priority = DEFAULT_PRIORITY;
  }

  if (!_.isNumber(priority)) {
    throw new Error('priority must be a number');
  }

  var self = this,
      listener = { priority: priority, callback: callback };

  events.forEach(function(e) {
    self._addListener(e, listener);
  });
};


/**
 * Register an event listener that is executed only once.
 *
 * @param {String} event the event name to register for
 * @param {Function} callback the callback to execute
 */
EventBus.prototype.once = function(event, callback) {

  var self = this;

  function wrappedCallback() {
    callback.apply(self, arguments);
    self.off(event, wrappedCallback);
  }

  this.on(event, wrappedCallback);
};


/**
 * Removes event listeners by event and callback.
 *
 * If no callback is given, all listeners for a given event name are being removed.
 *
 * @param {String} event
 * @param {Function} [callback]
 */
EventBus.prototype.off = function(event, callback) {
  var listeners = this._getListeners(event),
      l, i;

  if (callback) {

    // move through listeners from back to front
    // and remove matching listeners
    for (i = listeners.length - 1; !!(l = listeners[i]); i--) {
      if (l.callback === callback) {
        listeners.splice(i, 1);
      }
    }
  } else {
    // clear listeners
    listeners.length = 0;
  }
};


/**
 * Fires a named event.
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
 *
 * @return {Boolean} false if default was prevented, null if the propagation got stopped and true otherwise
 */
EventBus.prototype.fire = function(type, data) {

  var event,
      originalType,
      listeners, i, l,
      args;

  args = Array.prototype.slice.call(arguments);

  if (typeof type === 'string') {
    // remove name parameter
    args.shift();
  } else {
    event = type;
    type = event.type;
  }

  if (!type) {
    throw new Error('no event type specified');
  }

  listeners = this._listeners[type];

  if (!listeners) {
    return true;
  }

  // we make sure we fire instances of our home made
  // events here. We wrap them only once, though
  if (data instanceof Event) {
    // we are fine, we alread have an event
    event = data;
  } else {
    event = Object.create(Event.prototype);
    event.init(data);
  }

  // ensure we pass the event as the first parameter
  args[0] = event;

  // original event type (in case we delegate)
  originalType = event.type;

  try {

    // update event type before delegation
    if (type !== originalType) {
      event.type = type;
    }

    for (i = 0, l; !!(l = listeners[i]); i++) {

      // handle stopped propagation
      if (event.propagationStopped) {
        break;
      }

      try {
        // handle listener returning false
        if (l.callback.apply(null, args) === false) {
          event.preventDefault();
        }
      } catch (e) {
        if (!this.handleError(e)) {
          console.error('unhandled error in event listener');
          console.error(e.stack);

          throw e;
        }
      }
    }
  } finally {
    // reset event type after delegation
    if (type !== originalType) {
      event.type = originalType;
    }
  }

  // distinguish between default prevented (false)
  // and propagation stopped (null) as a return value
  return event.defaultPrevented ? false : (event.propagationStopped ? null : true);
};


EventBus.prototype.handleError = function(error) {
  return !this.fire('error', { error: error });
};


EventBus.prototype._addListener = function(event, listener) {

  var listeners = this._getListeners(event),
      i, l;

  // ensure we order listeners by priority from
  // 0 (high) to n > 0 (low)
  for (i = 0; !!(l = listeners[i]); i++) {
    if (l.priority < listener.priority) {
      listeners.splice(i, 0, listener);
      return;
    }
  }

  listeners.push(listener);
};


EventBus.prototype._getListeners = function(name) {
  var listeners = this._listeners[name];

  if (!listeners) {
    this._listeners[name] = listeners = [];
  }

  return listeners;
};
