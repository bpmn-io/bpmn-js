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

  // mapping shape.id -> container
  var shapeMap = {};

  // mapping gfx.id -> container
  var graphicsMap = {};

  function addShape(shape, gfx) {
    if (!shape.id) {
      throw new Error('[shapes] shape has no id');
    }

    if (!gfx.id) {
      throw new Error('[shapes] graphics has no id');
    }

    if (graphicsMap[gfx.id]) {
      throw new Error('graphics with id ' + gfx.id + ' already registered');
    }

    if (shapeMap[shape.id]) {
      throw new Error('shape with id ' + shape.id + ' already added');
    }

    shapeMap[shape.id] = graphicsMap[gfx.id] = { shape: shape, gfx: gfx };
  }

  function removeShape(shape) {
    var gfx = getGraphicsByElement(shape);

    if (shape.parent) {
      for(var i = 0; i < shape.parent.children.length;i++) {
        if(shape.parent.children[i].id === shape.id) {
          shape.parent.children.splice(i, 1);
        }
      }
    }
   // delete shape.parent.children[];
    delete shapeMap[shape.id];
    delete graphicsMap[gfx.id];
  }

  /**
   * @method ElementRegistry#getByGraphics
   */
  function getByGraphics(gfx) {
    var id = _.isString(gfx) ? gfx : gfx.id;

    var container = graphicsMap[id];
    if (container) {
      return container.shape;
    }
  }

  /**
   * @method ElementRegistry#getById
   */
  function getById(id) {
    var container = shapeMap[id];
    if (container) {
      return container.shape;
    }
  }

  /**
   * @method ElementRegistry#getGraphicsByElement
   */
  function getGraphicsByElement(shape) {
    var id = _.isString(shape) ? shape : shape.id;

    var container = shapeMap[id];
    if (container) {
      return container.gfx;
    }
  }

  eventBus.on('shape.added', function(event) {
    addShape(event.element, event.gfx);
  });

  eventBus.on('connection.added', function(event) {
    addShape(event.element, event.gfx);
  });

  eventBus.on('shape.removed', function(event) {
    removeShape(event.element);
  });

  eventBus.on('connection.removed', function(event) {
    removeShape(event.element);
  });

  return {
    getGraphicsByElement: getGraphicsByElement,
    getById: getById,
    getByGraphics: getByGraphics
  };
}

ElementRegistry.$inject = [ 'eventBus' ];

module.exports = ElementRegistry;