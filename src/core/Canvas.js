
/**
 * @class Canvas
 */
function Canvas(config, events, svgFactory) {

  var canvas = Snap(config.container);

  /**
   * Adds a shape to the drawing canvas
   *
   * @method Canvas#addShape
   * 
   * @param {Object} shape a descriptor for the shape
   */
  function addShape(shape) {
    var gfx = svgFactory.createShape(canvas, shape);
    events.fire('shape.added', { element: shape, gfx: gfx });
  }

  /**
   * Adds a connection to the drawing canvas
   *
   * @method Canvas#addConnection
   * 
   * @param {Object} connection a descriptor for the connection
   */
  function addConnection(connection) {
    var gfx = svgFactory.createConnection(canvas, connection);
    events.fire('connection.added', { element: connection, gfx: gfx });
  }

  return {
    addShape: addShape,
    addConnection: addConnection
  };
}

Canvas.$inject = ['config', 'events', 'svgFactory'];

module.exports = Canvas;