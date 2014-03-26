var diagramModule = require('../di').defaultModule;

var AddShapeHandler = require('../commands/AddShape');

var _ = require('lodash');

// required components
require('./Events');
require('./CommandStack');
require('./GraphicsFactory');
require('./Shapes');

/**
 * @type djs.ShapeDescriptor
 */

/**
 * @class
 *
 * @emits Canvas#canvas.init
 */
function Canvas(config, events, commandStack, graphicsFactory, shapes) {
  'use strict';

  var options = _.extend({}, { width: '100%', height: '100%' }, config.canvas || {});

  var paper = graphicsFactory.createPaper(options);


  /**
   * Adds a shape to the canvas
   *
   * @method Canvas#addShape
   *
   * @param {djs.ShapeDescriptor} shape a descriptor for the shape
   *
   * @return {Canvas} the canvas api
   */
  function addShape(shape) {

    if (!shape.id) {
      throw new Error('shape must have an id');
    }

    /**
     * An event indicating that a new shape has been added to the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.added
     * @type {Object}
     * @property {djs.ElementDescriptor} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */
    
    commandStack.execute('shape.add', { shape: shape });

    return this;
  }

  // register shape add handlers
  commandStack.registerHandler('shape.add', AddShapeHandler);


  /**
   * Adds a connection to the canvas
   *
   * @method Canvas#addConnection
   * 
   * @param {djs.ElementDescriptor} connection a descriptor for the connection
   * 
   * @return {Canvas} the canvas api
   */
  function addConnection(connection) {

    if (!connection.id) {
      throw new Error('connection must have an id');
    }

    var gfx = graphicsFactory.createConnection(paper, connection);

    /**
     * An event indicating that a new connection has been added to the canvas.
     *
     * @memberOf Canvas
     * 
     * @event connection.added
     * @type {Object}
     * @property {djs.ElementDescriptor} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */
    events.fire('connection.added', { element: connection, gfx: gfx });

    // for chaining of API calls
    return this;
  }

  /**
   * Sends a shape to the front.
   *
   * This method takes parent / child relationships between shapes into account
   * and makes sure that children are properly handled, too.
   *
   * @method Canvas#sendToFront
   * 
   * @param {djs.ElementDescriptor} shape descriptor of the shape to be sent to front
   * @param {boolean} bubble=true whether to send parent shapes to front, too
   */
  function sendToFront(shape, bubble) {

    if (bubble !== false) {
      bubble = true;
    }

    if (bubble && shape.parent) {
      sendToFront(shape.parent);
    }

    if (shape.children) {
      shape.children.forEach(function(child) {
        sendToFront(child, false);
      });
    }

    var gfx = getGraphics(shape),
        gfxParent = gfx.parent();

    gfx.remove().appendTo(gfxParent);
  }

  /**
   * Return the graphical object underlaying a certain diagram element
   *
   * @method Canvas#getGraphics
   * 
   * @param {djs.ElementDescriptor} element descriptor of the element
   */
  function getGraphics(element) {
    return shapes.getGraphicsByShape(element);
  }

  /**
   * Returns the actual graphics context.
   *
   * @returns {snapsvg.Paper} the global paper object
   */
  function getContext() {
    return paper;
  }

  function parseViewBox(str) {
    if (!str) {
      return;
    }

    var value = str.split(/\s/);

    return {
      x: parseInt(value[0], 10),
      y: parseInt(value[1], 10),
      width: parseInt(value[2], 10),
      height: parseInt(value[3], 10),
    };
  }

  function viewbox(box) {

    var svg = paper.node,
        boundingRect = svg.getBoundingClientRect(),
        bbox = svg.getBBox();

    var inner = {
      width: bbox.width + bbox.x,
      height: bbox.height + bbox.y
    };

    var outer = {
      width: boundingRect.width,
      height: boundingRect.height,
    };

    if (box === undefined) {
      box = parseViewBox(svg.getAttribute('viewBox'));

      if (!box) {
        box = { x: 0, y: 0, width: outer.width, height: outer.height };
      }

      // calculate current scale based on svg bbox (inner) and viewbox (outer)
      box.scale = Math.min(outer.width / box.width, outer.height / box.height);

      box.inner = inner;
      box.outer = outer;
    } else {
      svg.setAttribute('viewBox', [ box.x, box.y, box.width, box.height ].join(' '));
    }

    return box;
  }

  /**
   * Scales the canvas, optionally zooming to the specified position.
   *  
   * @param {String|Number} scale the new zoom level, either a number, i.e. 0.9 or 'viewport' to fit to the viewport.
   * @param {Object} [position]
   * @param {Number} position.x
   * @param {Number} position.y
   * 
   * @return {Number} the current scale after zooming
   */
  function scale(newScale, position) {

    var vbox = viewbox(),
        inner = vbox.inner,
        outer = vbox.outer;

    if (newScale === undefined) {
      return vbox.scale;
    }

    debugger;

    if (newScale === 'fit-viewport') {

      if (vbox.width < inner.width || vbox.height < inner.height) {
        newScale = Math.min(outer.width / inner.width, outer.height / inner.height);
      } else {
        newScale = vbox.scale;
      }
    }

    _.extend(vbox, {
      width: outer.width / newScale,
      height: outer.height / newScale
    }, position || {});


    viewbox(vbox);

    // return current scale
    return newScale;
  }

  /**
   * Add event listener to paper.
   */
  function addListener(id, eventListener) {
    paper.node.addEventListener(id, eventListener);
  }

  /**
   * Remove event from paper.
   */
  function removeListener(id, eventListener) {
    paper.node.removeEventListener(id, eventListener);
  }

  events.on('diagram.init', function(event) {
    
    /**
     * An event indicating that the canvas is ready to be drawn on.
     *
     * @memberOf Canvas
     * 
     * @event canvas.init
     * 
     * @type {Object}
     * @property {snapsvg.Paper} paper the initialized drawing paper
     */
    events.fire('canvas.init', { paper: paper });
  });

  return {
    scale: scale,
    viewbox: viewbox,
    addShape: addShape,
    addConnection: addConnection,
    getContext: getContext,
    getGraphics: getGraphics,
    sendToFront: sendToFront,
    addListener: addListener,
    removeListener: removeListener
  };
}

diagramModule.type('canvas', [ 'config', 'events', 'commandStack', 'graphicsFactory', 'shapes', Canvas ]);

module.exports = Canvas;