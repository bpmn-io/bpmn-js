'use strict';


var _ = require('lodash');

var remove = require('../util/Collections').remove;


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

function createGroup(parent, cls) {
  return parent.group().attr({ 'class' : cls });
}

var BASE_LAYER = 'base';


/**
 * The main drawing canvas.
 *
 * @class
 * @constructor
 *
 * @emits Canvas#canvas.init
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} elementRegistry
 * @param {Snap} snap
 */
function Canvas(config, eventBus, graphicsFactory, elementRegistry, snap) {

  this._snap = snap;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  this._init(config || {});
}

Canvas.$inject = [ 'config.canvas', 'eventBus', 'graphicsFactory', 'elementRegistry', 'snap' ];

module.exports = Canvas;


Canvas.prototype._init = function(config) {

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

  // html container
  var container = this._container = createContainer(config);

  // svg root
  var paper = this._paper = this._graphicsFactory.createPaper({
    container: container,
    width: '100%', height: '100%'
  });

  // drawing root
  var root = this._root = createGroup(paper, 'viewport');

  // layers
  this._layers = {};

  var eventBus = this._eventBus;

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

  var self = this;

  eventBus.on('diagram.destroy', function() {

    if (container) {
      var parent = container.parentNode;
      parent.removeChild(container);
    }

    self._paper.remove();

    self._paper = self._root = self._layers = self._container = null;
  });

};


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
 * Returns the root rendering context on which
 * all elements are drawn.
 *
 * @returns {snapsvg.Group}
 */
Canvas.prototype.getRoot = function() {
  return this._root;
};


Canvas.prototype.getLayer = function(name) {

  var layer = this._layers[name || BASE_LAYER];
  if (!layer) {
    layer = this._layers[name] = createGroup(this._root, 'layer-' + name);
  }

  return layer;
};


/**
 * Returns the html element that encloses the
 * drawing canvas.
 *
 * @return {DOMNode}
 */
Canvas.prototype.getContainer = function() {
  return this._container;
};


Canvas.prototype._updateMarker = function(element, marker, add) {
  var gfx;

  if (_.isString(element)) {
    element = this._elementRegistry.getById(element);
  }

  gfx = this.getGraphics(element);

  var mode = add ? 'add' : 'remove';

  // invoke either addClass or removeClass based on mode
  gfx[add ? 'addClass' : 'removeClass'](marker);

  /**
   * An event indicating that a marker has been updated for an element
   *
   * @event element.marker.update
   * @type {Object}
   * @property {djs.model.Element} element the shape
   * @property {Object} gfx the graphical representation of the shape
   * @property {String} marker
   * @property {Boolean} add true if the marker was added, false if it got removed
   */
  this._eventBus.fire('element.marker.update', { element: element,  gfx: gfx, marker: marker, add: !!add });
};


/**
 * Adds a marker to an element (basically a css class).
 *
 * Fires the element.marker.update event, making it possible to
 * integrate extension into the marker life-cycle, too.
 *
 * @example
 * canvas.addMarker('foo', 'some-marker');
 *
 * var fooGfx = canvas.getGraphics('foo');
 *
 * fooGfx; // <g class="... some-marker"> ... </g>
 *
 * @param {String|djs.model.Base} element
 * @param {String} marker
 */
Canvas.prototype.addMarker = function(element, marker) {
  this._updateMarker(element, marker, true);
};


/**
 * Remove a marker from an element.
 *
 * Fires the element.marker.update event, making it possible to
 * integrate extension into the marker life-cycle, too.
 *
 * @param  {String|djs.model.Base} element
 * @param  {String} marker
 */
Canvas.prototype.removeMarker = function(element, marker) {
  this._updateMarker(element, marker, false);
};


/**
 * Adds a shape to the canvas
 *
 * @param {Object|djs.model.Shape} shape to add to the diagram
 *
 * @return {djs.model.Shape} the added shape
 */
Canvas.prototype.addShape = function(shape, parent) {

  this._ensureValidId(shape);

  if (parent) {
    parent.children.push(shape);
    shape.parent = parent;
  }

  // create shape gfx
  var gfx = this._graphicsFactory.createShape(this.getLayer(BASE_LAYER), shape);

  /**
   * An event indicating that a new shape is being added to the canvas.
   *
   * @memberOf Canvas
   *
   * @event shape.add
   * @type {Object}
   * @property {djs.model.Shape} element the shape
   * @property {Object} gfx the graphical representation of the shape
   */
  this._eventBus.fire('shape.add', { element: shape, gfx: gfx });

  this._elementRegistry.add(shape, gfx);

  // update its visual
  this._graphicsFactory.updateShape(shape, gfx);

  /**
   * An event indicating that a new shape has been added to the canvas.
   *
   * @memberOf Canvas
   *
   * @event shape.added
   * @type {Object}
   * @property {djs.model.Shape} element the shape
   * @property {Object} gfx the graphical representation of the shape
   */
  this._eventBus.fire('shape.added', { element: shape, gfx: gfx });

  return shape;
};


/**
 * Adds a connection to the canvas
 *
 * @param {djs.model.Connection} connection to add to the diagram
 *
 * @return {djs.model.Connection} the added connection
 */
Canvas.prototype.addConnection = function(connection, parent) {

  this._ensureValidId(connection);

  if (parent) {
    parent.children.push(connection);
    connection.parent = parent;
  }

  // create connection gfx
  var gfx = this._graphicsFactory.createConnection(this.getLayer(BASE_LAYER), connection);

  /**
   * An event indicating that a new connection is being added to the canvas.
   *
   * @memberOf Canvas
   *
   * @event connection.add
   * @type {Object}
   * @property {djs.model.Connection} element the connection
   * @property {Object} gfx the graphical representation of the connection
   */
  this._eventBus.fire('connection.add', { element: connection, gfx: gfx });

  this._elementRegistry.add(connection, gfx);

  // update its visual
  this._graphicsFactory.updateConnection(connection, gfx);

  /**
   * An event indicating that a new connection has been added to the canvas.
   *
   * @memberOf Canvas
   *
   * @event connection.added
   * @type {Object}
   * @property {djs.model.Connection} element the connection
   * @property {Object} gfx the graphical representation of the connection
   */
  this._eventBus.fire('connection.added', { element: connection, gfx: gfx });

  return connection;
};


/**
 * Internal remove element
 */
Canvas.prototype._removeElement = function(element, type) {

  if (_.isString(element)) {
    element = this._elementRegistry.getById(element);
  }

  var gfx = this.getGraphics(element);

  this._eventBus.fire(type + '.remove', { element: element, gfx: gfx });

  if (gfx) {
    gfx.remove();
  }

  // unset parent <-> child relationship
  remove(element.parent && element.parent.children, element);
  element.parent = null;

  this._eventBus.fire(type + '.removed', { element: element, gfx: gfx });

  this._elementRegistry.remove(element, gfx);

  return element;
};


/**
 * Removes a shape from the canvas
 *
 * @param {String|djs.model.Shape} shape or shape id to be removed
 *
 * @return {djs.model.Shape} the removed shape
 */
Canvas.prototype.removeShape = function(shape) {

  /**
   * An event indicating that a shape is about to be removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event shape.remove
   * @type {Object}
   * @property {djs.model.Shape} element the shape descriptor
   * @property {Object} gfx the graphical representation of the shape
   */

  /**
   * An event indicating that a shape has been removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event shape.removed
   * @type {Object}
   * @property {djs.model.Shape} element the shape descriptor
   * @property {Object} gfx the graphical representation of the shape
   */
  return this._removeElement(shape, 'shape');
};


/**
 * Removes a connection from the canvas
 *
 * @param {String|djs.model.Connection} connection or connection id to be removed
 *
 * @return {djs.model.Connection} the removed connection
 */
Canvas.prototype.removeConnection = function(connection) {

  /**
   * An event indicating that a connection is about to be removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event connection.remove
   * @type {Object}
   * @property {djs.model.Connection} element the connection descriptor
   * @property {Object} gfx the graphical representation of the connection
   */

  /**
   * An event indicating that a connection has been removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event connection.removed
   * @type {Object}
   * @property {djs.model.Connection} element the connection descriptor
   * @property {Object} gfx the graphical representation of the connection
   */
  return this._removeElement(connection, 'connection');
};


/**
 * Sends a shape to the front.
 *
 * This method takes parent / child relationships between shapes into account
 * and makes sure that children are properly handled, too.
 *
 * @param {djs.model.Shape} shape descriptor of the shape to be sent to front
 * @param {boolean} [bubble=true] whether to send parent shapes to front, too
 */
Canvas.prototype.sendToFront = function(shape, bubble) {

  if (bubble !== false) {
    bubble = true;
  }

  if (bubble && shape.parent) {
    this.sendToFront(shape.parent);
  }

  _.forEach(shape.children, function(child) {
    this.sendToFront(child, false);
  }, this);

  var gfx = this.getGraphics(shape),
      gfxParent = gfx.parent();

  gfx.remove().appendTo(gfxParent);
};


/**
 * Return the graphical object underlaying a certain diagram element
 *
 * @param {String|djs.model.Base} element descriptor of the element
 */
Canvas.prototype.getGraphics = function(element) {
  return this._elementRegistry.getGraphicsByElement(element);
};


Canvas.prototype._fireViewboxChange = function(viewbox) {
  this._eventBus.fire('canvas.viewbox.changed', { viewbox: viewbox || this.viewbox() });
};


/**
 * Gets or sets the view box of the canvas, i.e. the area that is currently displayed
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

  var root = this._root;

  var innerBox,
      outerBox = this.getSize(),
      matrix,
      scale,
      x, y;

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
 * @param {String|Number} [newScale] the new zoom level, either a number, i.e. 0.9,
 *                                   or `fit-viewport` to adjust the size to fit the current viewport
 * @param {String|Point} [center] the reference point { x: .., y: ..} to zoom to, 'auto' to zoom into mid or null
 *
 * @return {Number} the current scale
 */
Canvas.prototype.zoom = function(newScale, center) {

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
  var bbox;

  // connection
  // use svg bbox
  if (element.waypoints) {
    var gfx = this.getGraphics(element);

    var transformBBox = gfx.getBBox(true);
    bbox = gfx.getBBox();

    bbox.x -= transformBBox.x;
    bbox.y -= transformBBox.y;

    bbox.width += 2 * transformBBox.x;
    bbox.height +=  2 * transformBBox.y;
  }
  // shapes
  // use data
  else {
    bbox = element;
  }

  var x = bbox.x * vbox.scale - vbox.x * vbox.scale;
  var y = bbox.y * vbox.scale - vbox.y * vbox.scale;

  var width = bbox.width * vbox.scale;
  var height = bbox.height * vbox.scale;

  return {
    x: x,
    y: y,
    width: width,
    height: height
  };
};