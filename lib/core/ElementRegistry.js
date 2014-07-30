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
  var elementMap = {};

  // mapping gfx.id -> container
  var graphicsMap = {};


  function add(element, gfx) {
    if (!element.id) {
      throw new Error('element has no id');
    }

    if (!gfx.id) {
      throw new Error('graphics has no id');
    }

    if (graphicsMap[gfx.id]) {
      throw new Error('graphics with id ' + gfx.id + ' already registered');
    }

    if (elementMap[element.id]) {
      throw new Error('element with id ' + element.id + ' already added');
    }

    elementMap[element.id] = graphicsMap[gfx.id] = { element: element, gfx: gfx };
  }

  function remove(element) {
    var gfx = getGraphicsByElement(element);

    delete elementMap[element.id];
    delete graphicsMap[gfx.id];
  }

  /**
   * @method ElementRegistry#getByGraphics
   */
  function getByGraphics(gfx) {
    var id = _.isString(gfx) ? gfx : gfx.id;

    var container = graphicsMap[id];
    return container && container.element;
  }

  /**
   * @method ElementRegistry#getById
   */
  function getById(id) {
    var container = elementMap[id];
    return container && container.element;
  }

  /**
   * @method ElementRegistry#getGraphicsByElement
   */
  function getGraphicsByElement(element) {
    var id = _.isString(element) ? element : element.id;

    var container = elementMap[id];
    return container && container.gfx;
  }


  _.forEach([ 'shape', 'connection' ], function(type) {
    eventBus.on(type + '.add', function(event) {
      add(event.element, event.gfx);
    });

    eventBus.on(type + '.removed', function(event) {
      remove(event.element, event.gfx);
    });
  });


  eventBus.on('diagram.destroy', function(event) {
    elementMap = null;
    graphicsMap = null;
  });

  return {
    getGraphicsByElement: getGraphicsByElement,
    getById: getById,
    getByGraphics: getByGraphics
  };
}

ElementRegistry.$inject = [ 'eventBus' ];

module.exports = ElementRegistry;