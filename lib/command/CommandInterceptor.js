'use strict';

var forEach = require('lodash/collection/forEach'),
    isFunction = require('lodash/lang/isFunction'),
    isArray = require('lodash/lang/isArray');


/**
 * A utility that can be used to plug-in into the command execution for
 * extension and/or validation.
 *
 * @param {EventBus} eventBus
 *
 * @example
 *
 * var inherits = require('inherits');
 *
 * var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');
 *
 * function CommandLogger(eventBus) {
 *   CommandInterceptor.call(this, eventBus);
 *
 *   this.preExecute(function(event) {
 *     console.log('command pre-execute', event);
 *   });
 * }
 *
 * inherits(CommandLogger, CommandInterceptor);
 *
 */
function CommandInterceptor(eventBus) {
  this._eventBus = eventBus;
}

CommandInterceptor.$inject = [ 'eventBus' ];

module.exports = CommandInterceptor;

function unwrapEvent(fn) {
  return function(event) {
    return fn(event.context, event.command, event);
  };
}

/**
 * Register an interceptor for a command execution
 *
 * @param  {String|Array<String>} [events] list of commands to register on
 * @param  {String} [hook] command hook, i.e. preExecute, executed to listen on
 * @param  {Function} handlerFn interceptor to be invoked with (event)
 * @param  {Boolean} unwrap if true, unwrap the event and pass (context, command, event) to the
 *                          listener instead
 */
CommandInterceptor.prototype.on = function(events, hook, handlerFn, unwrap) {

  if (isFunction(hook)) {
    unwrap = handlerFn;
    handlerFn = hook;
    hook = null;
  }

  if (!isFunction(handlerFn)) {
    throw new Error('handlerFn must be a function');
  }

  if (!isArray(events)) {
    events = [ events ];
  }

  var eventBus = this._eventBus;

  forEach(events, function(event) {
    // concat commandStack(.event)?(.hook)?
    var fullEvent = [ 'commandStack', event, hook ].filter(function(e) { return e; }).join('.');

    eventBus.on(fullEvent, unwrap ? unwrapEvent(handlerFn) : handlerFn);
  });
};


var hooks = [
  'canExecute',
  'preExecute',
  'execute',
  'executed',
  'postExecute',
  'revert',
  'reverted'
];

/*
 * Install hook shortcuts
 *
 * This will generate the CommandInterceptor#(preExecute|...|reverted) methods
 * which will in term forward to CommandInterceptor#on.
 */
forEach(hooks, function(hook) {
  CommandInterceptor.prototype[hook] = function(events, fn, unwrap) {
    if (isFunction(events)) {
      unwrap = fn;
      fn = events;
      events = null;
    }

    this.on(events, hook, fn, unwrap);
  };
});