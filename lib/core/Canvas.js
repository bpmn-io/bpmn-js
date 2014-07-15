'use strict';


var _ = require('lodash');


function round(number, resolution) {
  return Math.round(number * resolution) / resolution;
}

function ensurePx(number) {
  return _.isNumber(number) ? number + 'px' : number;
}

/**
 * Creates a HTML container element for a SVG element with
 * the given configuration
 *
 * @param  {Object} options
 * @return {HTMLElement} the container element
 */
function createContainer(options) {

  options = _.extend({}, { width: '100%', height: '100%' }, options);

  var container = options.container || document.body;

  // create a <div> around the svg element with the respective size
  // this way we can always get the correct container size
  // (this is impossible for <svg> elements at the moment)
  var parent = document.createElement('div');
  parent.setAttribute('class', 'djs-container');

  _.extend(parent.style, {
    position: 'relative',
    width: ensurePx(options.width),
    height: ensurePx(options.height)
  });

  container.appendChild(parent);

  return parent;
}


/**
 * @class
 *
 * @emits Canvas#canvas.init
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} elementRegistry
 */
function Canvas(config, eventBus, graphicsFactory, elementRegistry, snap) {

  var options = _.extend(config.canvas || {});

  this._snap = snap;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

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

  var container = this._container = createContainer(options);

  // svg root
  var paper = this._paper = createPaper(container);

  // drawing root
  var root = this._root = paper.group().attr({ 'class' : 'viewport' });


  function createPaper(container) {
    return graphicsFactory.createPaper({ container: container, width: '100%', height: '100%' });
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
   * Returns the root rendering context on which
   * all elements have to be drawn.
   *
   * @method Canvas#getRoot
   *
   * @returns {snapsvg.Group}
   */
  function getRoot() {
    return root;
  }

  eventBus.on('diagram.init', function(event) {

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
    eventBus.fire('canvas.init', { root: root, paper: paper });
  });

  eventBus.on('diagram.destroy', function() {

    if (container) {
      var parent = container.parentNode;
      parent.removeChild(container);
    }

    container = this._container = null;
    paper = this._paper = null;
    root = this._root = null;
  });


  // redraw shapes / connections on change

  var self = this;

  eventBus.on('element.changed', function(event) {

    if (event.element.waypoints) {
      eventBus.fire('connection.changed', event);
    } else {
      eventBus.fire('shape.changed', event);
    }
  });

  eventBus.on('shape.changed', function(event) {
    var element = event.element;
    graphicsFactory.updateShape(element, event.gfx || self.getGraphics(element));
  });

  eventBus.on('connection.changed', function(event) {
    var element = event.element;
    graphicsFactory.updateConnection(element, event.gfx || self.getGraphics(element));
  });

  this.getRoot  = getRoot;

  this.getContainer = function() {
    return this._container;
  };

  this.getGraphics = getGraphics;

  this.sendToFront = sendToFront;
}


/**
 * Ensure that an element has a valid, unique id
 *
 * @param {djs.model.Base} element
 */
Canvas.prototype._ensureValidId = function(element) {
  if (!element.id) {
    throw new Error('element must have an id');
  }

  if (this._elementRegistry.getById(element.id)) {
    throw new Error('element with id ' + element.id + ' already exists');
  }
};


/**
 * Adds a shape to the canvas
 *
 * @method Canvas#addShape
 *
 * @param {Object|djs.model.Shape} shape to add to the diagram
 *
 * @return {djs.model.Shape} the added shape
 */
Canvas.prototype.addShape = function(shape) {

  this._ensureValidId(shape);

  // create shape gfx
  var gfx = this._graphicsFactory.createShape(this._root, shape);

  // update its visual
  this._graphicsFactory.updateShape(shape, gfx);

  /**
   * An event indicating that a new shape has been added to the canvas.
   *
   * @memberOf Canvas
   *
   * @event shape.added
   * @type {Object}
   * @property {djs.Shape} element the shape descriptor
   * @property {Object} gfx the graphical representation of the shape
   */
  this._eventBus.fire('shape.added', { element: shape, gfx: gfx });

  return shape;
};


/**
 * Adds a connection to the canvas
 *
 * @method Canvas#addConnection
 *
 * @param {djs.model.Connection} connection to add to the diagram
 *
 * @return {djs.model.Connection} the added connection
 */
Canvas.prototype.addConnection = function(connection) {

  this._ensureValidId(connection);

  // create connection gfx
  var gfx = this._graphicsFactory.createConnection(this._root, connection);

  // update its visual
  this._graphicsFactory.updateConnection(connection, gfx);

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
  this._eventBus.fire('connection.added', { element: connection, gfx: gfx });

  return connection;
};


Canvas.prototype._fireViewboxChange = function(viewbox) {
  this._eventBus.fire('canvas.viewbox.changed', { viewbox: viewbox || this.viewbox() });
};

/**
 * Gets or sets the view box of the canvas, i.e. the area that is currently displayed
 *
 * @method Canvas#viewbox
 *
 * @param  {Object} [box] the new view box to set
 * @param  {Number} box.x the top left X coordinate of the canvas visible in view box
 * @param  {Number} box.y the top left Y coordinate of the canvas visible in view box
 * @param  {Number} box.width the visible width
 * @param  {Number} box.height
 *
 * @example
 *
 * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
 *
 * // sets the visible area of the diagram to (100|100) -> (600|100)
 * // and and scales it according to the diagram width
 *
 * @return {Object} the current view box
 */
Canvas.prototype.viewbox = function(box) {

  var root = this._root,
      eventBus = this._eventBus;

  var innerBox,
      outerBox = this.getSize(),
      matrix,
      scale,
      x, y,
      width, height;

  if (!box) {
    innerBox = root.getBBox(true);

    matrix = root.transform().localMatrix;
    scale = round(matrix.a, 1000);

    x = round(-matrix.e || 0, 1000);
    y = round(-matrix.f || 0, 1000);

    return {
      x: x ? x / scale : 0,
      y: y ? y / scale : 0,
      width: outerBox.width / scale,
      height: outerBox.height / scale,
      scale: scale,
      inner: {
        width: innerBox.width,
        height: innerBox.height
      },
      outer: outerBox
    };
  } else {
    scale = Math.max(outerBox.width / box.width, outerBox.height / box.height);

    matrix = new this._snap.Matrix().scale(scale).translate(-box.x, -box.y);
    root.transform(matrix);

    this._fireViewboxChange();
  }

  return box;
};


/**
 * Gets or sets the scroll of the canvas.
 *
 * @param {Object} [delta] the new scroll to apply.
 *
 * @param {Number} [delta.dx]
 * @param {Number} [delta.dy]
 */
Canvas.prototype.scroll = function(delta) {

  var node = this._root.node;
  var matrix = node.getCTM();

  if (delta) {
    delta = _.extend({ dx: 0, dy: 0 }, delta || {});

    matrix = this._paper.node.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);

    setCTM(node, matrix);

    this._fireViewboxChange();
  }

  return { x: matrix.e, y: matrix.f };
};


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
Canvas.prototype.zoom = function(newScale, center) {

  var snap = this._snap;

  var vbox = this.viewbox();

  if (newScale === undefined) {
    return vbox.scale;
  }

  var outer = vbox.outer;

  if (newScale === 'fit-viewport') {
    newScale = Math.min(1, outer.width / vbox.inner.width);
  }

  if (center === 'auto') {
    center = {
      x: outer.width / 2,
      y: outer.height / 2
    };
  }

  var matrix = this._setZoom(newScale, center);

  this._fireViewboxChange();

  return round(matrix.a, 1000);
};

function setCTM(node, m) {
  var mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')';
  node.setAttribute('transform', mstr);
}

Canvas.prototype._setZoom = function(scale, center) {

  var svg = this._paper.node,
      viewport = this._root.node;

  var matrix = svg.createSVGMatrix();
  var point = svg.createSVGPoint();

  var centerPoint,
      originalPoint,
      currentMatrix,
      scaleMatrix,
      newMatrix;

  currentMatrix = viewport.getCTM();


  var currentScale = currentMatrix.a;

  if (center) {
    centerPoint = _.extend(point, center);

    // revert applied viewport transformations
    originalPoint = centerPoint.matrixTransform(currentMatrix.inverse());

    // create scale matrix
    scaleMatrix = matrix
                    .translate(originalPoint.x, originalPoint.y)
                    .scale(1 / currentScale * scale)
                    .translate(-originalPoint.x, -originalPoint.y);

    newMatrix = currentMatrix.multiply(scaleMatrix);
  } else {
    newMatrix = matrix.scale(scale);
  }

  setCTM(this._root.node, newMatrix);

  return newMatrix;
};


/**
 * Returns the size of the canvas
 *
 * @return {Dimensions}
 */
Canvas.prototype.getSize = function () {
  return {
    width: this._container.clientWidth,
    height: this._container.clientHeight
  };
};


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
  'graphicsFactory',
  'elementRegistry',
  'snap' ];

module.exports = Canvas;