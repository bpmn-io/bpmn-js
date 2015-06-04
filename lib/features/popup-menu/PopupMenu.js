'use strict';

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    domEvent = require('min-dom/lib/event'),
    domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domAttr = require('min-dom/lib/attr'),
    domRemove = require('min-dom/lib/remove');


/**
 * A popup menu that can be used to display a list of actions anywhere in the canvas.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function PopupMenu(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas  = canvas;

  this._actions = {};
}

PopupMenu.$inject = [ 'eventBus', 'canvas' ];

/**
 * Creates the popup menu, adds entries and attaches it to the DOM.
 *
 * @param {String} name
 * @param {Object} position
 * @param {Array<Object>} entries
 * @param {Object} opts
 * @param {String} opts.encryClassName
 *
 * @return {Object} PopupMenu instance
 */
PopupMenu.prototype.open = function(name, position, entries, opts) {
  // make sure, only one popup menu is open at a time
  if (this.isOpen()) {
    this.close();
  }

  var canvas = this._canvas,
      parent = canvas.getContainer(),
      options = {
        entryClassName: 'entry'
      };

  this.name = name || 'popup-menu';

  assign(options, opts);

  this._createContainer(name, position);

  this._attachEntries(entries, options);

  this._attachContainer(parent);

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
  domRemove(this._container);
  this._container = null;
};


/**
 * Determines, if an open popup menu exist.
 * @return {Boolean}
 */
PopupMenu.prototype.isOpen = function() {
  return !!this._container;
};


/**
 * Trigger an action associated with an entry.
 *
 * @param {Object} event
 */
PopupMenu.prototype.trigger = function(event) {
  // silence other actions
  event.preventDefault();

  var element = event.target,
      actionName = element.getAttribute('data-action') ||
                   element.parentNode.getAttribute('data-action');

  var action = this._actions[actionName];


  if (action) {
    return action();
  }
};


/**
 * Creates the popup menu container.
 *
 * @param {String} event
 * @param {Object} position
 */
PopupMenu.prototype._createContainer = function(name, position) {
  var container = this._container = domify('<div class="djs-popup">');

  assign(container.style, {
    position: 'absolute',
    left: position.x + 'px',
    top: position.y  + 'px'
  });

  domClasses(container).add(name);
};


/**
 * Attaches the container to the DOM and binds the event handlers.
 *
 * @param {Object} parent
 */
PopupMenu.prototype._attachContainer = function(parent) {
  var self = this,
      container = this._container;

  // Event handler
  domEvent.bind(container, 'click', function(event) {
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
 * Attaches the entries (actions) to the container.
 *
 * @param {Array<Object>} entries
 * @param {String} entries[].label
 * @param {String} entries[].className
 * @param {Object} entries[].action
 * @param {String} entries[].action.name
 * @param {Function} entries[].action.handler
 * @param {Object} options
 */
PopupMenu.prototype._attachEntries = function(entries, options) {

  var self = this;

  forEach(entries, function(entry) {

    var entryContainer = domify('<div>');
    domClasses(entryContainer).add(entry.className || options.entryClassName);
    domClasses(entryContainer).add('djs-popup-entry');

    if (entry.style) {
      domAttr(entryContainer, 'style', entry.style);
    }

    if (entry.action) {
      domAttr(entryContainer, 'data-action', entry.action.name);
      self._actions[entry.action.name] = entry.action.handler;
    }

    var title = domify('<span>');
    title.textContent = entry.label;
    entryContainer.appendChild(title);

    self._container.appendChild(entryContainer);
  });
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
