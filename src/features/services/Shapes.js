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

  /**
   * @class
   * A prototype for shapes, offers basing functions
   */
  var Shape = {
    translate: function(x, y) {
      'use strict';

      this.x += x;
      this.y += y;
    }
  };

  /**
   * Creates a new object with prototype Shape.
   * @param {Object} baseObj all properties are copied on the new object
   *
   * @return {Object} Return an object with properties of baseObj and prototype = Shape
   */
  function convertToShape(baseObj) {
    'use strict';

    var extObj = Object.create(Shape);

    _.extend(extObj, baseObj);

    if(!extObj.hasOwnProperty('x')) {
      extObj.x = 0;
    }
    if(!extObj.hasOwnProperty('y')) {
      extObj.y = 0;
    }
    return extObj;
  }

  return {
    getGraphicsByShape: getGraphicsByShape,
    getShapeById: getShapeById,
    getShapeByGraphics: getShapeByGraphics,
    convertToShape: convertToShape
  };
}

Diagram.plugin('shapes', [ 'events', Shapes ]);

module.exports = Shapes;