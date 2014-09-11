'use strict';

var _ = require('lodash'),
    $ = require('jquery');


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
  _.forEach(this._providers, function(provider) {
    var e = provider.getContextPadEntries(element);

    _.forEach(e, function(entry, id) {
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
 */
ContextPad.prototype.trigger = function(action, event) {

  var current = this._current,
      element = current.element,
      entries = current.entries,
      entry,
      handler,
      button = $(event.target);

  button = button.is('.entry') ? button : button.parents('.djs-context-pad .entry');

  if (!button.length) {
    return event.preventDefault();
  }

  entry = entries[button.attr('data-action')];
  handler = entry.action;

  // simple action (via callback function)
  if (_.isFunction(handler)) {
    if (action === 'click') {
      return handler(event, element);
    }
  } else {
    if (handler[action]) {
      return handler[action](event, element);
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

  var pad = this.getPad(element);

  var entries = this.getEntries(element);

  var html = pad.html.html('');

  var self = this;

  _.forEach(entries, function(entry, id) {
    var control = $(entry.html || '<div class="entry"></div>').attr('data-action', id);

    var grouping = entry.group || 'default';

    var container = html.find('[data-group=' + grouping + ']');
    if (!container.length) {
      container = $('<div class="group"></div>').attr('data-group', grouping).appendTo(html);
    }

    control.appendTo(container);

    if (entry.className) {
      control.addClass(entry.className);
    }

    if (entry.imageUrl) {
      control.append('<img src="' + entry.imageUrl + '">');
    }
  });

  html.addClass('open');

  this._current = {
    element: element,
    pad: pad,
    entries: entries,
    open: true
  };
};

ContextPad.prototype.getPad = function(element) {

  var self = this;

  var overlays = this._overlays;

  var pads = overlays.get({ element: element, type: 'context-pad' });

  // create context pad on demand if needed
  if (!pads.length) {

    var html = $('<div class="djs-context-pad"></div>');

    html.on('click', function(event) {
      self.trigger('click', event);
    });

    html.on('dragstart', function(event) {
      self.trigger('dragstart', event);
    });

    overlays.add(element, 'context-pad', {
      position: {
        right: -6,
        top: -6
      },
      html: html
    });

    pads = overlays.get({ element: element, type: 'context-pad' });
  }

  return pads[0];
};


/**
 * Close the context pad
 */
ContextPad.prototype.close = function() {
  if (this._current) {
    if (this._current.open) {
      this._current.pad.html.removeClass('open');
    }

    this._current.open = false;
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