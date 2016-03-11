'use strict';

var isFunction = require('lodash/lang/isFunction'),
    forEach = require('lodash/collection/forEach');

var domify = require('min-dom/lib/domify'),
    domQuery = require('min-dom/lib/query'),
    domAttr = require('min-dom/lib/attr'),
    domClear = require('min-dom/lib/clear'),
    domClasses = require('min-dom/lib/classes'),
    domMatches = require('min-dom/lib/matches'),
    domDelegate = require('min-dom/lib/delegate'),
    domEvent = require('min-dom/lib/event');


var toggleSelector = '.djs-palette-toggle',
    entrySelector = '.entry',
    elementSelector = toggleSelector + ', ' + entrySelector;


/**
 * A palette containing modeling elements.
 */
function Palette(eventBus, canvas, dragging) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._dragging = dragging;

  this._providers = [];

  var self = this;

  eventBus.on('tool-manager.update', function(event) {
    var tool = event.tool;

    self.updateToolHighlight(tool);
  });

  eventBus.on('i18n.changed', function() {
    self._update();
  });
}

Palette.$inject = [ 'eventBus', 'canvas', 'dragging' ];

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
  forEach(this._providers, function(provider) {
    var e = provider.getPaletteEntries();

    forEach(e, function(entry, id) {
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
      container = this._container = domify(Palette.HTML_MARKUP),
      self = this;

  parent.appendChild(container);

  domDelegate.bind(container, elementSelector, 'click', function(event) {

    var target = event.delegateTarget;

    if (domMatches(target, toggleSelector)) {
      return self.toggle();
    }

    self.trigger('click', event);
  });

  // prevent drag propagation
  domEvent.bind(container, 'mousedown', function(event) {
    event.stopPropagation();
  });

  // prevent drag propagation
  domDelegate.bind(container, entrySelector, 'dragstart', function(event) {
    self.trigger('dragstart', event);
  });

  this._eventBus.fire('palette.create', {
    html: container
  });
};


Palette.prototype._update = function() {

  var entriesContainer = domQuery('.djs-palette-entries', this._container),
      entries = this._entries = this.getEntries();

  domClear(entriesContainer);

  forEach(entries, function(entry, id) {

    var grouping = entry.group || 'default';

    var container = domQuery('[data-group=' + grouping + ']', entriesContainer);
    if (!container) {
      container = domify('<div class="group" data-group="' + grouping + '"></div>');
      entriesContainer.appendChild(container);
    }

    var html = entry.html || (
      entry.separator ?
        '<hr class="separator" />' :
        '<div class="entry" draggable="true"></div>');


    var control = domify(html);
    container.appendChild(control);

    if (!entry.separator) {
      domAttr(control, 'data-action', id);

      if (entry.title) {
        domAttr(control, 'title', entry.title);
      }

      if (entry.className) {
        domClasses(control).add(entry.className);
      }

      if (entry.imageUrl) {
        control.appendChild(domify('<img src="' + entry.imageUrl + '">'));
      }
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
Palette.prototype.trigger = function(action, event, autoActivate) {
  var entries = this._entries,
      entry,
      handler,
      originalEvent,
      result = false,
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
      result = handler(originalEvent, autoActivate);
    }
  } else {
    if (handler[action]) {
      result = handler[action](originalEvent, autoActivate);
    }
  }

  // silence other actions
  event.preventDefault();
};


/**
 * Close the palette
 */
Palette.prototype.close = function() {
  domClasses(this._container).remove('open');
};


/**
 * Open the palette
 */
Palette.prototype.open = function() {
  domClasses(this._container).add('open');
};


Palette.prototype.toggle = function(open) {
  if (this.isOpen()) {
    this.close();
  } else {
    this.open();
  }
};

Palette.prototype.isActiveTool = function(tool) {
  return tool && this._activeTool === tool;
};

Palette.prototype.updateToolHighlight = function(name) {
  var entriesContainer,
      toolsContainer;

  if (!this._toolsContainer) {
    entriesContainer = domQuery('.djs-palette-entries', this._container);

    this._toolsContainer = domQuery('[data-group=tools]', entriesContainer);
  }

  toolsContainer = this._toolsContainer;

  forEach(toolsContainer.children, function(tool) {
    var actionName = tool.getAttribute('data-action');

    if (!actionName) {
      return;
    }

    actionName = actionName.replace('-tool', '');

    if (tool.classList.contains('entry') && actionName === name) {
      domClasses(tool).add('highlighted-entry');
    } else {
      domClasses(tool).remove('highlighted-entry');
    }
  });
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
  return this._container && domClasses(this._container).has('open');
};


/* markup definition */

Palette.HTML_MARKUP =
  '<div class="djs-palette">' +
    '<div class="djs-palette-entries"></div>' +
    '<div class="djs-palette-toggle"></div>' +
  '</div>';
