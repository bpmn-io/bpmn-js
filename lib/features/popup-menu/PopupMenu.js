'use strict';

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    find = require('lodash/collection/find');

var domDelegate = require('min-dom/lib/delegate'),
    domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domAttr = require('min-dom/lib/attr'),
    domRemove = require('min-dom/lib/remove');

var DATA_REF = 'data-id';

/**
 * A popup menu that can be used to display a list of actions anywhere in the canvas.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 *
 * @class
 * @constructor
 */
function PopupMenu(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas  = canvas;
  this._providers = {};
}

PopupMenu.$inject = [ 'eventBus', 'canvas' ];

/**
 * Registers a popup menu provider
 *
 * @param  {String} id
 * @param  {Object} provider
 *
 * @example
 * popupMenu.registerProvider('myMenuID', {
 *   getEntries: function(element) {
 *     return [
 *       {
 *          id: 'entry-1',
 *          label: 'My Entry',
 *          action: 'alert("I have been clicked!")'
 *        }
 *      ];
 *    }
 *  });
 * })
 */
PopupMenu.prototype.registerProvider = function(id, provider) {
  this._providers[id] = provider;
};


/**
 * Create a popup menu according to a given element. The id refers to the ID
 * of the provider that must be registered before.
 *
 * @param  {String} id provider id
 * @param  {Object} element
 *
 * @return {PopupMenu} popup menu instance
 */
PopupMenu.prototype.create = function(id, element) {

  var provider = this._providers[id];

  if (!provider) {
    throw new Error('Provider is not registered: ' + id);
  }

  if (!element) {
    throw new Error('Element is missing');
  }

  var current = this._current = {
    provider: provider,
    className: id,
    element: element
  };

  if (provider.getHeaderEntries) {
    current.headerEntries = provider.getHeaderEntries(element);
  }

  current.entries = provider.getEntries(element);

  return this;
};


/**
 * Determine if the popup menu has entries.
 *
 * @return {Boolean} true if empty
 */
PopupMenu.prototype.isEmpty = function () {

  var current = this._current;

  return current.entries.length === 0 && current.headerEntries && current.headerEntries.length === 0;
};


/**
 * Open popup menu at given position
 *
 * @param {Object} position
 *
 * @return {Object} popup menu instance
 */
PopupMenu.prototype.open = function(position) {

  if (!position) {
    throw new Error('the position argument is missing');
  }

  // make sure, only one popup menu is open at a time
  if (this.isOpen()) {
    this.close();
  }

  var current = this._current,
      canvas = this._canvas,
      parent = canvas.getContainer();

  current.position = position;

  current.container = this._createContainer();

  if (current.headerEntries) {
    var headerEntriesContainer = this._createEntries(current.headerEntries, 'djs-popup-header');

    current.container.appendChild(headerEntriesContainer);
  }

  if (current.entries) {
    var entriesContainer = this._createEntries(current.entries, 'djs-popup-body');

    current.container.appendChild(entriesContainer);
  }

  this._attachContainer(current.container, parent, position.cursor);

  return this;
};


/**
 * Removes the popup menu and unbinds the event handlers.
 */
PopupMenu.prototype.close = function() {

  if (!this.isOpen()) {
    return;
  }

  this._unbindHandlers();
  domRemove(this._current.container);
  this._current.container = null;
};


/**
 * Determine if an open popup menu exist.
 *
 * @return {Boolean} true if open
 */
PopupMenu.prototype.isOpen = function() {
  return !!this._current.container;
};


/**
 * Trigger an action associated with an entry.
 *
 * @param {Object} event
 *
 * @return the result of the action callback, if any
 */
PopupMenu.prototype.trigger = function(event) {

  // silence other actions
  event.preventDefault();

  var element = event.delegateTarget || event.target,
      entryId = domAttr(element, DATA_REF);

  var entry = this._getEntry(entryId);

  if (entry.action) {
    return entry.action.call(null, event, entry);
  }
};

/**
 * Gets an entry instance (either entry or headerEntry) by id.
 *
 * @param  {String} entryId
 *
 * @return {Object} entry instance
 */
PopupMenu.prototype._getEntry = function(entryId) {

  var search = { id: entryId };

  var entry = find(this._current.entries, search) || find(this._current.headerEntries, search);

  if (!entry) {
    throw new Error('entry not found');
  }

  return entry;
};


/**
 * Creates the popup menu container.
 *
 * @return {Object} a DOM container
 */
PopupMenu.prototype._createContainer = function() {
  var container = domify('<div class="djs-popup">'),
      position = this._current.position,
      className = this._current.className;

  assign(container.style, {
    position: 'absolute',
    left: position.x + 'px',
    top: position.y + 'px',
    visibility: 'hidden'
  });

  domClasses(container).add(className);

  return container;
};


/**
 * Attaches the container to the DOM and binds the event handlers.
 *
 * @param {Object} container
 * @param {Object} parent
 */
PopupMenu.prototype._attachContainer = function(container, parent, cursor) {
  var self = this;

   // Event handler
  domDelegate.bind(container, '.entry' ,'click', function(event) {
    self.trigger(event);
  });

  // apply canvas zoom level
  var zoom = this._canvas.zoom();

  container.style.transformOrigin = 'top left';
  container.style.transform = 'scale(' + zoom + ')';

  // Attach to DOM
  parent.appendChild(container);

  if (cursor) {
    this._assureIsInbounds(container, cursor);
  }

  // Add Handler
  this._bindHandlers();
};


/**
 * Make sure that the menu is always fully shown
 *
 * @method function
 *
 * @param  {Object} container
 * @param  {Position} cursor {x, y}
 */
PopupMenu.prototype._assureIsInbounds = function(container, cursor) {
  var canvas = this._canvas,
      clientRect = canvas._container.getBoundingClientRect();

  var conX = container.offsetLeft,
      conY = container.offsetTop,
      conWidth = container.scrollWidth,
      conHeight = container.scrollHeight,
      overAxis = {},
      left, top;

  var curPos = {
    x: cursor.x - clientRect.left,
    y: cursor.y - clientRect.top
  };

  if (conX + conWidth > clientRect.width) {
    overAxis.x = true;
  }

  if (conY + conHeight > clientRect.height) {
    overAxis.y = true;
  }

  if (overAxis.x && overAxis.y) {
    left = curPos.x - conWidth + 'px';
    top = curPos.y - conHeight + 'px';
  } else if (overAxis.x) {
    left = curPos.x - conWidth + 'px';
    top = curPos.y + 'px';
  } else if (overAxis.y) {
    left = curPos.x + 'px';
    top = curPos.y - conHeight + 'px';
  }

  assign(container.style, { left: left, top: top }, { visibility: 'visible', 'z-index': 1000 });
};


/**
 * Creates a list of entries and returns them as a DOM container.
 *
 * @param {Array<Object>} entries an array of entry objects
 * @param {String} className the class name of the entry container
 *
 * @return {Object} a DOM container
 */
PopupMenu.prototype._createEntries = function(entries, className) {

  var entriesContainer = domify('<div>'),
      self = this;

  domClasses(entriesContainer).add(className);

  forEach(entries, function(entry) {
    var entryContainer = self._createEntry(entry, entriesContainer);
    entriesContainer.appendChild(entryContainer);
  });

  return entriesContainer;
};


/**
 * Creates a single entry and returns it as a DOM container.
 *
 * @param  {Object} entry
 *
 * @return {Object} a DOM container
 */
PopupMenu.prototype._createEntry = function(entry) {

    if (!entry.id) {
      throw new Error ('every entry must have the id property set');
    }

    var entryContainer = domify('<div>'),
        entryClasses = domClasses(entryContainer);

    entryClasses.add('entry');

    if (entry.className) {
      entryClasses.add(entry.className);
    }

    domAttr(entryContainer, DATA_REF, entry.id);

    if (entry.label) {
      var label = domify('<span>');
      label.textContent = entry.label;
      entryContainer.appendChild(label);
    }

    if (entry.imageUrl) {
      entryContainer.appendChild(domify('<img src="' + entry.imageUrl + '" />'));
    }

    if (entry.active === true) {
      entryClasses.add('active');
    }

    if (entry.disabled === true) {
      entryClasses.add('disabled');
    }

    if (entry.title) {
      entryContainer.title = entry.title;
    }

    return entryContainer;
};


/**
 * Binds the `close` method to 'contextPad.close' & 'canvas.viewbox.changed'.
 */
PopupMenu.prototype._bindHandlers = function() {

  var eventBus = this._eventBus,
      self = this;

  function close() {
    self.close();
  }

  eventBus.once('contextPad.close', close);
  eventBus.once('canvas.viewbox.changing', close);
  eventBus.once('commandStack.changed', close);
};


/**
 * Unbinds the `close` method to 'contextPad.close' & 'canvas.viewbox.changing'.
 */
PopupMenu.prototype._unbindHandlers = function() {

  var eventBus = this._eventBus,
      self = this;

  function close() {
    self.close();
  }

  eventBus.off('contextPad.close', close);
  eventBus.off('canvas.viewbox.changed', close);
  eventBus.off('commandStack.changed', close);
};

module.exports = PopupMenu;
