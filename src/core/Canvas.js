
/**
 * @class
 *
 * @emits Canvas#event:"canvas.init"
 */
function Canvas(config, events, svgFactory) {
  'use strict';

  var paper = Snap(config.container);

  /**
   * Adds a shape to the canvas
   *
   * @method Canvas#addShape
   * 
   * @param {Object} shape a descriptor for the shape
   */
  function addShape(shape) {
    var gfx = svgFactory.createShape(paper, shape);

    /**
     * An event indicating that a new shape has been added to the canvas.
     *
     * @memberOf Canvas
     * 
     * @event shape.added
     * @type {Object}
     * @property {Object} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */
    events.fire('shape.added', { element: shape, gfx: gfx });
  }

  /**
   * Adds a connection to the canvas
   *
   * @method Canvas#addConnection
   * 
   * @param {Object} connection a descriptor for the connection
   */
  function addConnection(connection) {
    var gfx = svgFactory.createConnection(paper, connection);

    /**
     * An event indicating that a new connection has been added to the canvas.
     *
     * @memberOf Canvas
     * 
     * @event connection.added
     * @type {Object}
     * @property {Object} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */
    events.fire('connection.added', { element: connection, gfx: gfx });
  }

  /**
   * Returns the actual graphics context.
   *
   * @returns {Object} the global paper object
   */
  function getContext() {
    return paper;
  }

  /**
   * An event indicating that the canvas is ready to be drawn on.
   *
   * @event Canvas#"canvas.init"
   * @type {Object}
   * @property {Object} paper the initialized drawing paper
   */
  events.fire('canvas.init', { paper: paper });

  return {
    addShape: addShape,
    addConnection: addConnection,
    getContext: getContext
  };
}

Canvas.$inject = ['config', 'events', 'svgFactory'];

module.exports = Canvas;