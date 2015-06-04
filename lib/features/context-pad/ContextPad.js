'use strict';

var isFunction = require('lodash/lang/isFunction'),
    forEach = require('lodash/collection/forEach'),

    domDelegate = require('min-dom/lib/delegate'),
    domClear = require('min-dom/lib/clear'),
    domEvent = require('min-dom/lib/event'),
    domAttr = require('min-dom/lib/attr'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    domify = require('min-dom/lib/domify');


var entrySelector = '.entry';


/**
 * A context pad that displays element specific, contextual actions next
 * to a diagram element.
 *
 * @param {EventBus} eventBus
 * @param {Overlays} overlays
 */
function ContextPad(eventBus, overlays) {

  this._providers = [];

  this._eventBus = eventBus;
  this._overlays = overlays;

  this._current = null;

  this._init();
}

ContextPad.$inject = [ 'eventBus', 'overlays' ];

/**
 * Registers events needed for interaction with other components
 */
ContextPad.prototype._init = function() {

  var eventBus = this._eventBus;

  var self = this;

  eventBus.on('selection.changed', function(e) {

    var selection = e.newSelection;

    if (selection.length === 1) {
      self.open(selection[0]);
    } else {
      self.close();
    }
  });
};


/**
 * Register a provider with the context pad
 *
 * @param  {ContextPadProvider} provider
 */
ContextPad.prototype.registerProvider = function(provider) {
  this._providers.push(provider);
};


/**
 * Returns the context pad entries for a given element
 *
 * @param {djs.element.Base} element
 *
 * @return {Array<ContextPadEntryDescriptor>} list of entries
 */
ContextPad.prototype.getEntries = function(element) {
  var entries = {};

  // loop through all providers and their entries.
  // group entries by id so that overriding an entry is possible
  forEach(this._providers, function(provider) {
    var e = provider.getContextPadEntries(element);

    forEach(e, function(entry, id) {
      entries[id] = entry;
    });
  });

  return entries;
};


/**
 * Trigger an action available on the opened context pad
 *
 * @param  {String} action
 * @param  {Event} event
 * @param  {Boolean} [autoActivate=false]
 */
ContextPad.prototype.trigger = function(action, event, autoActivate) {

  var current = this._current,
      element = current.element,
      entries = current.entries,
      entry,
      handler,
      originalEvent,
      button = event.delegateTarget || event.target;

  if (!button) {
    return event.preventDefault();
  }

  entry = entries[domAttr(button, 'data-action')];
  handler = entry.action;

  originalEvent = event.originalEvent || event;

  // simple action (via callback function)
  if (isFunction(handler)) {
    if (action === 'click') {
      return handler(originalEvent, element, autoActivate);
    }
  } else {
    if (handler[action]) {
      return handler[action](originalEvent, element, autoActivate);
    }
  }

  // silence other actions
  event.preventDefault();
};


/**
 * Open the context pad for the given element
 *
 * @param {djs.model.Base} element
 */
ContextPad.prototype.open = function(element) {

  if (this._current && this._current.open) {

    if (this._current.element === element) {
      // no change needed
      return;
    }

    this.close();
  }

  this._updateAndOpen(element);
};


ContextPad.prototype._updateAndOpen = function(element) {

  var entries = this.getEntries(element),
      pad = this.getPad(element),
      html = pad.html;

  domClear(html);

  forEach(entries, function(entry, id) {
    var grouping = entry.group || 'default',
        control = domify(entry.html || '<div class="entry" draggable="true"></div>'),
        container;

    domAttr(control, 'data-action', id);

    container = domQuery('[data-group=' + grouping + ']', html);
    if (!container) {
      container = domify('<div class="group" data-group="' + grouping + '"></div>');
      html.appendChild(container);
    }

    container.appendChild(control);

    if (entry.className) {
      domClasses(control).add(entry.className);
    }

    if (entry.title) {
      domAttr(control, 'title', entry.title);
    }

    if (entry.imageUrl) {
      control.appendChild(domify('<img src="' + entry.imageUrl + '">'));
    }
  });

  domClasses(html).add('open');

  this._current = {
    element: element,
    pad: pad,
    entries: entries,
    open: true
  };

  this._eventBus.fire('contextPad.open', { current: this._current });
};

ContextPad.prototype.getPad = function(element) {

  var self = this;

  var overlays = this._overlays,
      pads = overlays.get({ element: element, type: 'context-pad' });

  // create context pad on demand if needed
  if (!pads.length) {

    var html = domify('<div class="djs-context-pad"></div>');

    domDelegate.bind(html, entrySelector, 'click', function(event) {
      self.trigger('click', event);
    });

    domDelegate.bind(html, entrySelector, 'dragstart', function(event) {
      self.trigger('dragstart', event);
    });

    // stop propagation of mouse events
    domEvent.bind(html, 'mousedown', function(event) {
      event.stopPropagation();
    });

    overlays.add(element, 'context-pad', {
      position: {
        right: -9,
        top: -6
      },
      html: html
    });

    pads = overlays.get({ element: element, type: 'context-pad' });

    this._eventBus.fire('contextPad.create', { element: element, pad: pads[0] });
  }

  return pads[0];
};


/**
 * Close the context pad
 */
ContextPad.prototype.close = function() {

  var html;

  if (this._current) {
    if (this._current.open) {
      html = this._current.pad.html;
      domClasses(html).remove('open');
    }

    this._current.open = false;

    this._eventBus.fire('contextPad.close', { current: this._current });
  }
};


/**
 * Return the element the context pad is currently opened for,
 * if it is opened.
 *
 * @example
 *
 * contextPad.open(shape1);
 *
 * if (contextPad.isOpen()) {
 *   // yes, we are open
 * }
 *
 * @return {djs.model.Base} element
 */
ContextPad.prototype.isOpen = function() {
  return this._current && this._current.open;
};

module.exports = ContextPad;
