'use strict';

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    domDelegate = require('min-dom/lib/delegate'),
    domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domAttr = require('min-dom/lib/attr'),
    domRemove = require('min-dom/lib/remove'),
    find = require('lodash/collection/find');


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
 * // create a more complex popup menu
 * popupMenu.open({
 *   position: { x: 100, y: 100 },
 *   entries: [
 *     {
 *       id: 'entry-1',
 *       label: 'Entry 1',
 *       action: function(event, entry) {
 *         // do some stuff
 *       }
 *     }
 *   ],
 *   headerEntries: [
 *     {
 *       id: 'header-entry-a',
 *       label: 'Header Entry A',
 *       action: function(event, entry){
 *         if (entry.active) {
 *           // Removes the HTML class 'active' from the entry div, if it is clicked.
 *           popupMenu.update(entry, { active: false });
 *         } else {
*           // Adds the HTML class 'active' from the entry div, if it is clicked.
 *           popupMenu.update(entry, { active: true });
 *         }
 *       }
 *     }
 *   ]
 * });
 *
 * // With popupMenu.update() it is possbile to update a certain entry by id.
 * // This functionality can be used to add the HTML classes 'active' or
 * // 'disabled' to a certain entry div element. This can be useful in action
 * // handler functions (see complex example above).
 * popupMenu.update('header-entry-a', { active: true });
 * popupMenu.update('header-entry-a', { disabled: true });
 *
 * // It is also possible to remove these classes:
 * popupMenu.update('header-entry-a', { active: false });
 * popupMenu.update('header-entry-a', { disabled: false });
 *
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
}

PopupMenu.$inject = [ 'eventBus', 'canvas' ];


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
    this._createEntries(headerEntries, container, 'djs-popup-header');
  }

  this._createEntries(entries, container, 'djs-popup-body');

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
    return entry.action.call(null, event, entry);
  }
};


/**
 * Updates the attributes of an entry instance.
 *
 * The properties `active` and `disabled` will be added to entries as class names.
 * This allows for state specific styling.
 *
 * @example
 *
 * popupMenu.update('header-entry-a', { active: true });
 * popupMenu.update('header-entry-a', { disabled: true });
 *
 * @param  {String|Object} entry the id of an entry or the entry instance itself
 * @param  {Object} updatedAttrs an object with the attributes that will be updated
 */
PopupMenu.prototype.update = function(entry, updatedAttrs) {

  if (typeof entry === 'string') {
    entry = this._getEntry(entry);
  }

  assign(entry, updatedAttrs);

  // redraw the menu by reopening it
  this.open(this._current.menu);
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
PopupMenu.prototype._createEntries = function(entries, container, className) {

  var entriesContainer = domify('<div>'),
      self = this;

  domClasses(entriesContainer).add(className);

  forEach(entries, function(entry) {
    self._createEntry(entry, entriesContainer);
  });

  container.appendChild(entriesContainer);
};


/**
 * Creates a single entry and attaches it to the specified DOM container.
 *
 * @param  {Object} entry
 * @param  {Object} container
 */
PopupMenu.prototype._createEntry = function(entry, container) {

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

    container.appendChild(entryContainer);
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
};

module.exports = PopupMenu;