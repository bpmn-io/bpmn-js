require('../core/Events');

var Diagram = require('../Diagram'),
    _ = require('../util/underscore');

/**
 * @class
 * 
 * A registry that keeps track of all shapes in the diagram.
 * 
 * @param {Events} events the event bus
 */
function Shapes(events) {

  var nextId = 0;

  var shapeMap = {};
  var graphicsMap = {};

  function assignId(prefix, e) {
    e.id = prefix + nextId++;
  }

  function addShape(shape, graphics) {
    if (!shape.id) {
      assignId('s', shape);
    }

    if (!graphics.id) {
      assignId('g', graphics);
    }

    if (graphicsMap[graphics.id]) {
      throw new Error('[mod] graphics with id ' + graphics.id + ' already registered');
    }

    if (shapeMap[shape.id]) {
      throw new Error('[mod] shape with id ' + shape.id + ' already added');
    }

    shapeMap[shape.id] = graphicsMap[graphics.id] = { shape: shape, graphics: graphics };
  }

  function removeShape(shape) {
    var graphics = getGraphicsByShape(shape);

    delete shapeMap[shape.id];
    delete graphicsMap[graphics.id];
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
  function getShapeByGraphics(graphics) {
    var id = _.isString(graphics) ? graphics : graphics.id;

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
      return container.graphics;
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