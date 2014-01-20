
/**
 * @class Canvas
 */
function Canvas(config, events, svgFactory) {

  var canvas = Snap(config.container);

  /**
   * @method Canvas.addShape
   */
  function addShape(shape) {
    var gfx = svgFactory.createShape(canvas, shape);
    events.fire('shape.added', { element: shape, gfx: gfx });
  }

  /**
   * @method Canvas.addConnection
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