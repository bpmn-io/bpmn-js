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

  eventBus.on([
    'shape.hover',
    'shape.click'
  ], function(e) {
    self.open(e.element);
  });

  eventBus.on('shape.out', function(e) {
    self.close(e.element);
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
 * @param  {String} id the identifier of the action
 * @param  {Event} event
 */
ContextPad.prototype.triggerAction = function(id, event) {

  var current = this._current;

  if (!current) {
    throw new Error('context pad not initialized');
  }

  var entry = current.entries[id];
  entry.action(event, current.element);
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
    var control = $(entry.html || '<div class="entry"></div>').attr('data-action', id).appendTo(html);

    if (entry.className) {
      control.addClass(entry.className);
    }

    if (entry.imageUrl) {
      control.append('<img src="' + entry.imageUrl + '">');
    }

    control.on('click', function(event) {
      self.triggerAction(id, event);
    });
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

  var overlays = this._overlays;

  var pads = overlays.get({ element: element, type: 'context-pad' });

  // create context pad on demand if needed
  if (!pads.length) {
    overlays.add(element, 'context-pad', {
      position: {
        right: 0,
        top: -5
      },
      html: '<div class="djs-context-pad"></div>'
    });

    pads = overlays.get({ element: element, type: 'context-pad' });
  }

  return pads[0];
};


/**
 * Close the context pad
 */
ContextPad.prototype.close = function() {
  if (this._current && this._current.open) {
    this._current.pad.html.removeClass('open');
  }

  this._current.open = false;
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