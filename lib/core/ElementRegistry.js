'use strict';

var _ = require('lodash');


/**
 * @class
 *
 * A registry that keeps track of all shapes in the diagram.
 *
 * @param {EventBus} eventBus the event bus
 */
function ElementRegistry(eventBus) {

  // mapping element.id -> container
  this._elementMap = {};

  // mapping gfx.id -> container
  this._graphicsMap = {};


  var self = this;

  eventBus.on('diagram.destroy', function(event) {
    self._elementMap = null;
    self._graphicsMap = null;
  });
}

ElementRegistry.$inject = [ 'eventBus' ];

module.exports = ElementRegistry;


ElementRegistry.prototype.add = function(element, gfx) {
  if (!element.id) {
    throw new Error('element has no id');
  }

  if (!gfx.id) {
    throw new Error('graphics has no id');
  }

  if (this._graphicsMap[gfx.id]) {
    throw new Error('graphics with id ' + gfx.id + ' already registered');
  }

  if (this._elementMap[element.id]) {
    throw new Error('element with id ' + element.id + ' already added');
  }

  this._elementMap[element.id] = this._graphicsMap[gfx.id] = { element: element, gfx: gfx };
};

ElementRegistry.prototype.remove = function(element) {
  var gfx = this.getGraphicsByElement(element);

  delete this._elementMap[element.id];
  delete this._graphicsMap[gfx.id];
};


/**
 * @method ElementRegistry#getByGraphics
 */
ElementRegistry.prototype.getByGraphics = function(gfx) {
  var id = gfx.id || gfx;

  var container = this._graphicsMap[id];
  return container && container.element;
};


/**
 * @method ElementRegistry#getById
 */
ElementRegistry.prototype.getById = function(id) {
  var container = this._elementMap[id];
  return container && container.element;
};

/**
 * @method ElementRegistry#getGraphicsByElement
 */
ElementRegistry.prototype.getGraphicsByElement = function(element) {
  var id = element.id || element;

  var container = this._elementMap[id];
  return container && container.gfx;
};
