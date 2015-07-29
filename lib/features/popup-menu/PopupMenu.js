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
 * {@link PopupMenu#open} is used to create and open the popup menu.
 * With {@link PopupMenu#update} it is possible to update certain entries in the popup menu
 * (see examples below).
 *
 * @example
 *
 * // create a basic popup menu
 * popupMenu.open(
 *   {
 *     position: { x: 100, y: 100 },
 *     entries: [
 *       {
 *         id: 'entry-1',
 *         label: 'Entry 1',
 *         action: function(event, entry) {
 *           // do some stuff
 *         }
 *       },
 *       {
 *         id: 'entry-2',
 *         label: 'Entry 2'
 *       }
 *     ]
 *   }
 * );
 *
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 *
 * @class
 * @constructor
 */
function PopupMenu(eventBus, canvas, modeling) {

  this._eventBus = eventBus;
  this._canvas  = canvas;
  this._modeling = modeling;
}

PopupMenu.$inject = [ 'eventBus', 'canvas', 'modeling' ];


/**
 * Creates the popup menu, adds entries and attaches it to the DOM.
 *
 * @param {Object} menu
 * @param {Object} menu.position
 * @param {String} [menu.className] a custom HTML class name for the popup menu
 *
 * @param {Array.<Object>} menu.entries
 * @param {String} menu.entries[].id
 * @param {String} menu.entries[].label
 * @param {String} [menu.entries[].className] a custom HTML class name for the entry div element
 * @param {Object} [menu.entries[].action] a handler function that will be called on a click on the entry
 *
 * @param {Array.<Object>} [menu.headerEntries]
 * @param {String} menu.headerEntries[].id
 * @param {String} [menu.headerEntries[].label]
 * @param {String} [menu.headerEntries[].imageUrl]
 * @param {String} [menu.headerEntries[].className] a custom HTML class name for the entry div element
 * @param {Object} [menu.headerEntries[].action] a handler function that will be called on a click on the entry
 *
 * @return {PopupMenu}
 */
PopupMenu.prototype.open = function(menu) {

  var className = menu.className || 'popup-menu',
      position = menu.position,
      entries = menu.entries,
      headerEntries = menu.headerEntries;

  if (!position) {
    throw new Error('the position argument is missing');
  }

  if (!entries) {
    throw new Error('the entries argument is missing');
  }

  // make sure, only one popup menu is open at a time
  if (this.isOpen()) {
    this.close();
  }

  var canvas = this._canvas,
      parent = canvas.getContainer(),
      container = this._createContainer(className, position);

  if (headerEntries) {
    var headerEntriesContainer = this._createEntries(headerEntries, 'djs-popup-header');
    container.appendChild(headerEntriesContainer);
  }

  var entriesContainer = this._createEntries(entries, 'djs-popup-body');
  container.appendChild(entriesContainer);

  this._attachContainer(container, parent);

  this._current = {
    container: container,
    menu: menu
  };

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
  this._current = null;
};


/**
 * Determines, if an open popup menu exist.
 * @return {Boolean}
 */
PopupMenu.prototype.isOpen = function() {
  return !!this._current;
};


/**
 * Trigger an action associated with an entry.
 *
 * @param {Object} event
 */
PopupMenu.prototype.trigger = function(event) {

  // silence other actions
  event.preventDefault();

  var element = event.delegateTarget || event.target,
      entryId = domAttr(element, DATA_REF);

  var entry = this._getEntry(entryId);

  if (entry.action) {
    var result = entry.action.call(null, event, entry);

    this.close();

    return result;
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

  var menu = this._current.menu,
      search = { id: entryId };

  var entry = find(menu.entries, search) || find(menu.headerEntries, search);

  if (!entry) {
    throw new Error('entry not found');
  }

  return entry;
};


/**
 * Creates the popup menu container.
 *
 * @param {String} event
 * @param {Object} position
 */
PopupMenu.prototype._createContainer = function(className, position) {
  var container = domify('<div class="djs-popup">');

  assign(container.style, {
    position: 'absolute',
    left: position.x + 'px',
    top: position.y  + 'px'
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
PopupMenu.prototype._attachContainer = function(container, parent) {
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

  // Add Handler
  this._bindHandlers();
};


/**
 * Creates and attaches entries to the popup menu.
 *
 * @param {Array<Object>} entries an array of entry objects
 * @param {Object} container the parent DOM container
 * @param {String} className the class name of the entry container
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
 * Creates a single entry and attaches it to the specified DOM container.
 *
 * @param  {Object} entry
 * @param  {Object} container
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
  eventBus.once('canvas.viewbox.changed', close);
  eventBus.once('commandStack.changed', close);
};


/**
 * Unbinds the `close` method to 'contextPad.close' & 'canvas.viewbox.changed'.
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
