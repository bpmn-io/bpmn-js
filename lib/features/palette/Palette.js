'use strict';

var _ = require('lodash'),
    $ = require('jquery');


/**
 * A palette containing modeling elements.
 */
function Palette(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._providers = [];
}

Palette.$inject = [ 'eventBus', 'canvas' ];

module.exports = Palette;


/**
 * Register a provider with the palette
 *
 * @param  {PaletteProvider} provider
 */
Palette.prototype.registerProvider = function(provider) {
  this._providers.push(provider);

  if (!this._container) {
    this._init();
  }

  this._update();
};


/**
 * Returns the palette entries for a given element
 *
 * @return {Array<PaletteEntryDescriptor>} list of entries
 */
Palette.prototype.getEntries = function() {

  var entries = {};

  // loop through all providers and their entries.
  // group entries by id so that overriding an entry is possible
  _.forEach(this._providers, function(provider) {
    var e = provider.getPaletteEntries();

    _.forEach(e, function(entry, id) {
      entries[id] = entry;
    });
  });

  return entries;
};


/**
 * Initialize
 */
Palette.prototype._init = function() {
  var parent = this._canvas.getContainer(),
      container = this._container = $(Palette.HTML_MARKUP).appendTo(parent),
      self = this;

  container.find('.djs-palette-toggle').click(function() {
    self.toggle();
  });

  // register event delegation
  container.on('click', function(event) {
    self.trigger('click', event);
  });

  // prevent drag propagation
  container.on('mousedown', function(event) {
    event.stopPropagation();
  });

  container.on('dragstart', function(event) {
    self.trigger('dragstart', event);
  });
};


Palette.prototype._update = function() {

  var entriesContainer = this._container.find('.djs-palette-entries').empty(),
      entries = this._entries = this.getEntries(),
      self = this;

  _.forEach(entries, function(entry, id) {

    var grouping = entry.group || 'default';

    var container = entriesContainer.find('[data-group=' + grouping + ']');
    if (!container.length) {
      container = $('<div class="group"></div>').attr('data-group', grouping).appendTo(entriesContainer);
    }

    var html = entry.html || '<div class="entry" draggable="true"></div>';

    var control = $(html).attr('data-action', id).appendTo(container);

    if (entry.className) {
      control.addClass(entry.className);
    }

    if (entry.imageUrl) {
      control.append('<img src="' + entry.imageUrl + '">');
    }
  });

  // open after update
  this.open(true);
};


/**
 * Trigger an action available on the palette
 *
 * @param  {String} action
 * @param  {Event} event
 */
Palette.prototype.trigger = function(action, event) {

  var entries = this._entries,
      entry,
      handler,
      originalEvent,
      button = $(event.target);

  button = button.is('.entry') ? button : button.parents('.djs-palette .entry');

  if (!button.length) {
    return event.preventDefault();
  }

  entry = entries[button.attr('data-action')];
  handler = entry.action;

  originalEvent = event.originalEvent || event;

  // simple action (via callback function)
  if (_.isFunction(handler)) {
    if (action === 'click') {
      return handler(originalEvent);
    }
  } else {
    if (handler[action]) {
      return handler[action](originalEvent);
    }
  }

  // silence other actions
  event.preventDefault();
};


/**
 * Close the palette
 */
Palette.prototype.close = function() {
  this._container.removeClass('open');
};


/**
 * Open the palette
 */
Palette.prototype.open = function() {
  this._container.addClass('open');
};


Palette.prototype.toggle = function(open) {
  if (this.isOpen()) {
    this.close();
  } else {
    this.open();
  }
};


/**
 * Return true if the palette is opened.
 *
 * @example
 *
 * palette.open();
 *
 * if (palette.isOpen()) {
 *   // yes, we are open
 * }
 *
 * @return {boolean} true if palette is opened
 */
Palette.prototype.isOpen = function() {
  return this._container && this._container.hasClass('open');
};


/* markup definition */

Palette.HTML_MARKUP =
  '<div class="djs-palette">' +
    '<div class="djs-palette-entries"></div>' +
    '<div class="djs-palette-toggle"></div>' +
  '</div>';