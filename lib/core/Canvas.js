'use strict';


var _ = require('lodash');

var AddShapeHandler = require('./cmd/AddShapeHandler'),
    AddConnectionHandler = require('./cmd/AddConnectionHandler');


/**
 * @type djs.ShapeDescriptor
 */

/**
 * Creates a HTML container element for a SVG element with
 * the given configuration
 *
 * @param  {Object} options
 * @return {DOMElement} the container element
 */
function createContainer(options) {

  options = _.extend({}, { width: '100%', height: '100%' }, options);

  var container = options.container || document.body;

  // create a <div> around the svg element with the respective size
  // this way we can always get the correct container size
  // (this is impossible for <svg> elements at the moment)
  var parent = document.createElement('div');
  parent.setAttribute('class', 'djs-container');

  parent.style.position = 'relative';
  parent.style.width = _.isNumber(options.width) ? options.width + 'px' : options.width;
  parent.style.height = _.isNumber(options.height) ? options.height + 'px' : options.height;

  container.appendChild(parent);

  return parent;
}


/**
 * @class
 *
 * @emits Canvas#canvas.init
 *
 * @param {Object} config
 * @param {EventBus} events
 * @param {CommandStack} commandStack
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} elementRegistry
 */
function Canvas(config, events, commandStack, graphicsFactory, elementRegistry) {

  var options = _.extend(config.canvas || {});


  // Creates a <svg> element that is wrapped into a <div>.
  // This way we are always able to correctly figure out the size of the svg element
  // by querying the parent node.
  //
  // (It is not possible to get the size of a svg element cross browser @ 2014-04-01)
  //
  // <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
  //   <svg width="100%" height="100%">
  //    ...
  //   </svg>
  // </div>

  var container = createContainer(options);
  var paper = createPaper(container);


  function createPaper(container) {
    return graphicsFactory.createPaper({ container: container, width: '100%', height: '100%' });
  }

  /**
   * Validate the id of an element, ensuring it is present and not yet assigned
   */
  function validateId(element) {

    if (!element.id) {
      throw new Error('element must have an id');
    }

    if (elementRegistry.getById(element.id)) {
      throw new Error('element with id ' + element.id + ' already exists');
    }
  }


  // register shape add handlers
  commandStack.registerHandler('shape.add', AddShapeHandler);

  // register connection add handlers
  commandStack.registerHandler('connection.add', AddConnectionHandler);



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

    validateId(shape);

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

    /* jshint -W040 */
    return this;
  }


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

    validateId(connection);

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

    commandStack.execute('connection.add', { connection: connection });

    /* jshint -W040 */
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
    return elementRegistry.getGraphicsByElement(element);
  }

  /**
   * Returns the underlaying graphics context.
   *
   * @method Canvas#getPaper
   *
   * @returns {snapsvg.Paper} the global paper object
   */
  function getPaper() {
    return paper;
  }

  /**
   * Returns the size of the canvas
   *
   * @return {Object} with x/y coordinates
   */
  function getSize() {

    return {
      width: container.clientWidth,
      height: container.clientHeight
    };
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

  /**
   * Gets or sets the view box of the canvas, i.e. the area that is currently displayed
   *
   * @method Canvas#viewbox
   *
   * @param  {Object} [box] the new view box to set
   * @return {Object} the current view box
   */
  function viewbox(box) {

    var svg = paper.node,
        bbox = svg.getBBox();

    function round(i, accuracy) {
      if (!i) {
        return i;
      }

      accuracy = accuracy || 100;
      return Math.round(i * accuracy) / accuracy;
    }

    var inner = {
      width: round(bbox.width + bbox.x),
      height: round(bbox.height + bbox.y)
    };

    // returns the acutal embedded size of the SVG element
    // would be awesome to be able to use svg.client(Width|Height) or
    // svg.getBoundingClientRect(). Not supported in IE/Firefox though
    var outer = getSize(svg);

    if (box === undefined) {
      box = parseViewBox(svg.getAttribute('viewBox'));

      if (!box) {
        box = { x: 0, y: 0, width: outer.width, height: outer.height };
      }

      // calculate current scale based on svg bbox (inner) and viewbox (outer)
      box.scale = round(Math.min(outer.width / box.width, outer.height / box.height));

      box.inner = inner;
      box.outer = outer;
    } else {
      svg.setAttribute('viewBox', [ box.x, box.y, box.width, box.height ].join(' '));
      events.fire('canvas.viewbox.changed', { viewbox: viewbox() });
    }

    return box;
  }

  /**
   * Gets or sets the scroll of the canvas.
   *
   * @param {Object} [delta] the new scroll to apply.
   *
   * @param {Number} [delta.dx]
   * @param {Number} [delta.dy]
   *
   * @return {Point} the new scroll
   */
  function scroll(delta) {

    var vbox = viewbox();

    if (delta) {
      if (delta.dx) {
        vbox.x += delta.dx;
      }

      if (delta.dy) {
        vbox.y += delta.dy;
      }

      viewbox(vbox);
    }

    return { x: vbox.x, y: vbox.y };
  }

  /**
   * Gets or sets the current zoom of the canvas, optionally zooming to the specified position.
   *
   * @method Canvas#zoom
   *
   * @param {String|Number} [newScale] the new zoom level, either a number, i.e. 0.9,
   *                                   or `fit-viewport` to adjust the size to fit the current viewport
   * @param {String|Point} [center] the reference point { x: .., y: ..} to zoom to, 'auto' to zoom into mid or null
   *
   * @return {Number} the current scale
   */
  function zoom(newScale, center) {

    var vbox = viewbox(),
        inner = vbox.inner,
        outer = vbox.outer;

    if (newScale === undefined) {
      return vbox.scale;
    }

    if (newScale === 'fit-viewport') {
      newScale = Math.min(outer.width / inner.width, outer.height / inner.height, 1.0);

      // reset viewbox so that everything is visible
      _.extend(vbox, { x: 0, y: 0 });
    }

    if (center === 'auto') {
      center = {
        x: outer.width / 2 - 1,
        y: outer.height / 2 - 1
      };
    }

    if (center) {

      // zoom to center (i.e. simulate a maps like behavior)

      // center on old zoom
      var pox = center.x / vbox.scale + vbox.x;
      var poy = center.y / vbox.scale + vbox.y;

      // center on new zoom
      var pnx = center.x / newScale;
      var pny = center.y / newScale;

      // delta = new offset
      var px = pox - pnx;
      var py = poy - pny;

      var position = {
        x: px,
        y: py
      };

      _.extend(vbox, position);
    }

    _.extend(vbox, {
      width: outer.width / newScale,
      height: outer.height / newScale
    });

    viewbox(vbox);

    // return current scale
    return newScale;
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

  events.on('diagram.destroy', function() {

    if (container) {
      var parent = container.parentNode;
      parent.removeChild(container);
    }

    container = null;
    paper = null;
  });


  // redraw shapes / connections on change

  var self = this;

  events.on('element.changed', function(event) {

    if (event.element.waypoints) {
      events.fire('connection.changed', event);
    } else {
      events.fire('shape.changed', event);
    }
  });

  events.on('shape.changed', function(event) {
    var element = event.element;
    graphicsFactory.updateShape(element, event.gfx || self.getGraphics(element));
  });

  events.on('connection.changed', function(event) {
    var element = event.element;
    graphicsFactory.updateConnection(element, event.gfx || self.getGraphics(element));
  });


  this.zoom = zoom;
  this.scroll = scroll;

  this.viewbox = viewbox;
  this.addShape = addShape;

  this.addConnection = addConnection;
  this.getPaper = getPaper;

  this.getGraphics = getGraphics;

  this.sendToFront = sendToFront;
}

/**
 * Return the absolute bounding box for the given element
 *
 * The absolute bounding box may be used to display overlays in the
 * callers (browser) coordinate system rather than the zoomed in/out
 * canvas coordinates.
 *
 * @param  {ElementDescriptor} element
 * @return {Bounds} the absolute bounding box
 */
Canvas.prototype.getAbsoluteBBox = function(element) {
  var vbox = this.viewbox();

  var gfx = this.getGraphics(element);

  var transformBBox = gfx.getBBox(true);
  var bbox = gfx.getBBox();

  var x = (bbox.x - transformBBox.x) * vbox.scale - vbox.x * vbox.scale;
  var y = (bbox.y - transformBBox.y) * vbox.scale - vbox.y * vbox.scale;

  var width = (bbox.width + 2 * transformBBox.x) * vbox.scale;
  var height = (bbox.height + 2 * transformBBox.y) * vbox.scale;

  return {
    x: x,
    y: y,
    width: width,
    height: height
  };
};

Canvas.$inject = [
  'config',
  'eventBus',
  'commandStack',
  'graphicsFactory',
  'elementRegistry' ];

module.exports = Canvas;