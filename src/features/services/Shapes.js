require('../../core/Events');

var Diagram = require('../../Diagram'),
    _ = require('../../util/underscore');

/**
 * @class
 * 
 * A registry that keeps track of all shapes in the diagram.
 * 
 * @param {Events} events the event bus
 */
function Shapes(events) {

  var shapeMap = {};
  var graphicsMap = {};

  function addShape(shape, gfx) {
    if (!shape.id) {
      throw new Error('[shapes] shape has no id');
    }

    if (!gfx.id) {
      throw new Error('[shapes] graphics has no id');
    }

    if (graphicsMap[gfx.id]) {
      throw new Error('[mod] graphics with id ' + gfx.id + ' already registered');
    }

    if (shapeMap[shape.id]) {
      throw new Error('[mod] shape with id ' + shape.id + ' already added');
    }

    shapeMap[shape.id] = graphicsMap[gfx.id] = { shape: shape, gfx: gfx };
  }

  function removeShape(shape) {
    var gfx = getGraphicsByShape(shape);

    delete shapeMap[shape.id];
    delete graphicsMap[gfx.id];
  }

  /**
   * @method Shapes#getShapeById
   */
  function getShapeById(id) {
    var container = shapeMap[id];
    if (container) {
      return container.shape;
    }
  }

  /**
   * @method Shapes#getShapeByGraphics
   */
  function getShapeByGraphics(gfx) {
    var id = _.isString(gfx) ? gfx : gfx.id;

    var container = graphicsMap[id];
    if (container) {
      return container.shape;
    }
  }

  /**
   * @method Shapes#getGraphicsByShape
   */
  function getGraphicsByShape(shape) {
    var id = _.isString(shape) ? shape : shape.id;

    var container = shapeMap[id];
    if (container) {
      return container.gfx;
    }
  }

  events.on('shape.added', function(event) {
    addShape(event.element, event.gfx);
  });

  events.on('connection.added', function(event) {
    addShape(event.element, event.gfx);
  });

  events.on('shape.removed', function(event) {
    removeShape(event.element);
  });

  events.on('connection.removed', function(event) {
    removeShape(event.element);
  });

  return {
    getGraphicsByShape: getGraphicsByShape,
    getShapeById: getShapeById,
    getShapeByGraphics: getShapeByGraphics
  };
}

Diagram.plugin('shapes', [ 'events', Shapes ]);

module.exports = Shapes;