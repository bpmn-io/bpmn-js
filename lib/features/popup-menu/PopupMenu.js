'use strict';

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    domEvent = require('min-dom/lib/event'),
    domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domAttr = require('min-dom/lib/attr'),
    domRemove = require('min-dom/lib/remove');


function PopupMenu(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas  = canvas;
  this._instances = {};
}

PopupMenu.$inject = [ 'eventBus', 'canvas' ];

module.exports = PopupMenu;

PopupMenu.prototype.open = function(name, position, entries, options) {

  var outer = this,
      canvas = this._canvas,
      instances = outer._instances;

  // return existing instance
  if (instances[name]) {
    return instances[name];
  }

  var parent = canvas.getContainer();

  //------------------------
  function PopupMenuInstance() {

    var self = this;

    self._actions = {};
    self.name = name || 'popup-menu';

    var _options = {
      entryClassName: 'entry'
    };
    assign(_options, options);

    // Container setup
    var container = this._container = domify('<div class="djs-popup">');

    assign(container.style, {
      position: 'absolute',
      left: position.x + 'px',
      top: position.y  + 'px'
    });
    domClasses(container).add(name);

    // Add entries
    forEach(entries, function(entry) {

      var entryContainer = domify('<div>');
      domClasses(entryContainer).add(entry.className || _options.entryClassName);
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

      container.appendChild(entryContainer);
    });

    // Event handler
    domEvent.bind(container, 'click', function(event) {
      self.trigger(event);
    });

    // apply canvas zoom level
    var zoom = canvas.zoom();

    container.style.transformOrigin = 'top left';
    container.style.transform = 'scale(' + zoom + ')';

    // Attach to DOM
    parent.appendChild(container);

    // Add Handler
    this.bindHandlers();
  }

  PopupMenuInstance.prototype.close = function() {
    this.unbindHandlers();
    domRemove(this._container);
    delete outer._instances[this.name];
  };

  PopupMenuInstance.prototype.bindHandlers = function() {

    var self = this,
        eventBus = outer._eventBus;

    this._closeHandler = function() {
      self.close();
    };

    eventBus.once('contextPad.close', this._closeHandler);
    eventBus.once('canvas.viewbox.changed', this._closeHandler);
  };

  PopupMenuInstance.prototype.unbindHandlers = function() {

    var eventBus = outer._eventBus;

    eventBus.off('contextPad.close', this._closeHandler);
    eventBus.off('canvas.viewbox.changed', this._closeHandler);
  };

  PopupMenuInstance.prototype.trigger = function(event) {

    var element = event.target,
        actionName = element.getAttribute('data-action') ||
                     element.parentNode.getAttribute('data-action');

    var action = this._actions[actionName];


    if (action) {
      action();
    }

    // silence other actions
    event.preventDefault();
  };

  var instance = outer._instances[name] = new PopupMenuInstance(position, entries, parent, options);

  return instance;
};
