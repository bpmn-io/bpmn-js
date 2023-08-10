import {
  every,
  debounce,
  bind,
  find
} from 'min-dash';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getType
} from 'diagram-js/lib/util/Elements';


/**
 * @typedef {import('./Types').ConnectionLike} ConnectionLike
 * @typedef {import('./Types').RootLike} RootLike
 * @typedef {import('./Types').ParentLike } ParentLike
 * @typedef {import('./Types').ShapeLike} ShapeLike
 *
 * @typedef { {
 *   container?: HTMLElement;
 *   deferUpdate?: boolean;
 *   width?: number;
 *   height?: number;
 * } } CanvasConfig
 * @typedef { {
 *   group: SVGElement;
 *   index: number;
 *   visible: boolean;
 * } } CanvasLayer
 * @typedef { {
 *   [key: string]: CanvasLayer;
 * } } CanvasLayers
 * @typedef { {
 *   rootElement: ShapeLike;
 *   layer: CanvasLayer;
 * } } CanvasPlane
 * @typedef { {
 *   scale: number;
 *   inner: Rect;
 *   outer: Dimensions;
 * } & Rect } CanvasViewbox
 *
 * @typedef {import('./ElementRegistry').default} ElementRegistry
 * @typedef {import('./EventBus').default} EventBus
 * @typedef {import('./GraphicsFactory').default} GraphicsFactory
 *
 * @typedef {import('../util/Types').Dimensions} Dimensions
 * @typedef {import('../util/Types').Point} Point
 * @typedef {import('../util/Types').Rect} Rect
 * @typedef {import('../util/Types').RectTRBL} RectTRBL
 */

function findRoot(element) {
  while (element.parent) {
    element = element.parent;
  }

  return element;
}

const BASE_LAYER = 'base';

// render plane contents behind utility layers
const PLANE_LAYER_INDEX = 0;
const UTILITY_LAYER_INDEX = 1;


const REQUIRED_MODEL_ATTRS = {
  shape: [ 'x', 'y', 'width', 'height' ],
  connection: [ 'waypoints' ]
};

/**
 * The main drawing canvas.
 *
 * @class
 * @constructor
 *
 * @emits Canvas#canvas.init
 *
 * @param {CanvasConfig|null} config
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} elementRegistry
 */
export default function Canvas(config, eventBus, graphicsFactory, elementRegistry) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  /**
   * @type {number}
   */
  this._rootsIdx = 0;

  /**
   * @type {CanvasLayers}
   */
  this._layers = {};

  /**
   * @type {CanvasPlane[]}
   */
  this._planes = [];

  /**
   * @type {RootLike|null}
   */
  this._rootElement = null;

  this._init(config || {});
}

Canvas.$inject = [
  'config.canvas',
  'eventBus',
  'graphicsFactory',
  'elementRegistry'
];

/**
 * Initializes the canvas.
 *
 * @param {CanvasConfig} config
 */
Canvas.prototype._init = function(config) {

  // mocked parent elements
  this._container = null;
  this._svg = null;
  this._viewport = null;

  // debounce canvas.viewbox.changed events
  // for smoother diagram interaction
  if (config.deferUpdate !== false) {
    this._viewboxChanged = debounce(bind(this._viewboxChanged, this), 300);
  }

  this._eventBus.on('diagram.init', () => {

    /**
     * An event indicating that the canvas is ready to be drawn on.
     *
     * @memberOf Canvas
     *
     * @event canvas.init
     *
     * @type {Object}
     * @property {SVGElement} svg the created svg element
     * @property {SVGElement} viewport the direct parent of diagram elements and shapes
     */
    this._eventBus.fire('canvas.init', {
      svg: this._svg,
      viewport: this._viewport
    });

  });

  this._eventBus.on('diagram.destroy', 500, this._destroy, this);
  this._eventBus.on('diagram.clear', 500, this._clear, this);
};

Canvas.prototype._destroy = function() {
  this._eventBus.fire('canvas.destroy', {
    svg: this._svg,
    viewport: this._viewport
  });

  delete this._svg;
  delete this._container;
  delete this._layers;
  delete this._planes;
  delete this._rootElement;
  delete this._viewport;
};

Canvas.prototype._clear = function() {

  const allElements = this._elementRegistry.getAll();

  // remove all elements
  allElements.forEach(element => {
    const type = getType(element);

    if (type === 'root') {
      this.removeRootElement(element);
    } else {
      this._removeElement(element, type);
    }
  });

  // remove all planes
  this._planes = [];
  this._rootElement = null;
};

/**
 * Returns the default layer on which
 * all elements are drawn.
 *
 * @return {SVGElement}  The SVG element of the layer.
 */
Canvas.prototype.getDefaultLayer = function() {
  return this.getLayer(BASE_LAYER, PLANE_LAYER_INDEX);
};

/**
 * Returns a layer that is used to draw elements
 * or annotations on it.
 *
 * Non-existing layers retrieved through this method
 * will be created. During creation, the optional index
 * may be used to create layers below or above existing layers.
 * A layer with a certain index is always created above all
 * existing layers with the same index.
 *
 * @param {string} name The name of the layer.
 * @param {number} [index] The index of the layer.
 *
 * @return {SVGElement} The SVG element of the layer.
 */
Canvas.prototype.getLayer = function(name, index) {

  if (!name) {
    throw new Error('must specify a name');
  }

  let layer = this._layers[name];

  if (!layer) {
    layer = this._layers[name] = this._createLayer(name, index);
  }

  // throw an error if layer creation / retrival is
  // requested on different index
  if (typeof index !== 'undefined' && layer.index !== index) {
    throw new Error('layer <' + name + '> already created at index <' + index + '>');
  }

  return layer.group;
};

/**
 * Creates a given layer and returns it.
 *
 * @param {string} name
 * @param {number} [index=0]
 *
 * @return {CanvasLayer}
 */
Canvas.prototype._createLayer = function(name, index) {

  if (typeof index === 'undefined') {
    index = UTILITY_LAYER_INDEX;
  }

  return {
    group: {},
    index: index,
    visible: true
  };
};


/**
 * Shows a given layer.
 *
 * @param {string} name The name of the layer.
 *
 * @return {SVGElement} The SVG element of the layer.
 */
Canvas.prototype.showLayer = function(name) {

  if (!name) {
    throw new Error('must specify a name');
  }

  const layer = this._layers[name];

  if (!layer) {
    throw new Error('layer <' + name + '> does not exist');
  }

  const group = layer.group;

  layer.visible = true;

  return group;
};

/**
 * Hides a given layer.
 *
 * @param {string} name The name of the layer.
 *
 * @return {SVGElement} The SVG element of the layer.
 */
Canvas.prototype.hideLayer = function(name) {

  if (!name) {
    throw new Error('must specify a name');
  }

  const layer = this._layers[name];

  if (!layer) {
    throw new Error('layer <' + name + '> does not exist');
  }

  const group = layer.group;

  if (!layer.visible) {
    return group;
  }

  layer.visible = false;

  return group;
};


Canvas.prototype._removeLayer = function(name) {

  const layer = this._layers[name];

  if (layer) {
    delete this._layers[name];
  }
};

/**
 * Returns the currently active layer. Can be null.
 *
 * @return {CanvasLayer|null} The active layer of `null`.
 */
Canvas.prototype.getActiveLayer = function() {
  const plane = this._findPlaneForRoot(this.getRootElement());

  if (!plane) {
    return null;
  }

  return plane.layer;
};


/**
 * Returns the plane which contains the given element.
 *
 * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
 *
 * @return {RootLike|undefined} The root of the element.
 */
Canvas.prototype.findRoot = function(element) {
  if (typeof element === 'string') {
    element = this._elementRegistry.get(element);
  }

  if (!element) {
    return;
  }

  const plane = this._findPlaneForRoot(
    findRoot(element)
  ) || {};

  return plane.rootElement;
};

/**
 * Return a list of all root elements on the diagram.
 *
 * @return {(RootLike)[]} The list of root elements.
 */
Canvas.prototype.getRootElements = function() {
  return this._planes.map(function(plane) {
    return plane.rootElement;
  });
};

Canvas.prototype._findPlaneForRoot = function(rootElement) {
  return find(this._planes, function(plane) {
    return plane.rootElement === rootElement;
  });
};


/**
 * Returns the html element that encloses the
 * drawing canvas.
 *
 * @return {HTMLElement} The HTML element of the container.
 */
Canvas.prototype.getContainer = function() {
  return this._container;
};


// markers //////////////////////

/**
 * Adds a marker to an element (basically a css class).
 *
 * Fires the element.marker.update event, making it possible to
 * integrate extension into the marker life-cycle, too.
 *
 * @example
 *
 * ```javascript
 * canvas.addMarker('foo', 'some-marker');
 *
 * const fooGfx = canvas.getGraphics('foo');
 *
 * fooGfx; // <g class="... some-marker"> ... </g>
 * ```
 *
 * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
 * @param {string} marker The marker.
 */
Canvas.prototype.addMarker = function(element, marker) {};


/**
 * Remove a marker from an element.
 *
 * Fires the element.marker.update event, making it possible to
 * integrate extension into the marker life-cycle, too.
 *
 * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
 * @param {string} marker The marker.
 */
Canvas.prototype.removeMarker = function(element, marker) {

};

/**
 * Check whether an element has a given marker.
 *
 * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
 * @param {string} marker The marker.
 */
Canvas.prototype.hasMarker = function(element, marker) {
  return false;
};

/**
 * Toggles a marker on an element.
 *
 * Fires the element.marker.update event, making it possible to
 * integrate extension into the marker life-cycle, too.
 *
 * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
 * @param {string} marker The marker.
 */
Canvas.prototype.toggleMarker = function(element, marker) {
  if (this.hasMarker(element, marker)) {
    this.removeMarker(element, marker);
  } else {
    this.addMarker(element, marker);
  }
};

/**
 * Returns the current root element.
 *
 * Supports two different modes for handling root elements:
 *
 * 1. if no root element has been added before, an implicit root will be added
 * and returned. This is used in applications that don't require explicit
 * root elements.
 *
 * 2. when root elements have been added before calling `getRootElement`,
 * root elements can be null. This is used for applications that want to manage
 * root elements themselves.
 *
 * @return {RootLike} The current root element.
 */
Canvas.prototype.getRootElement = function() {
  const rootElement = this._rootElement;

  // can return null if root elements are present but none was set yet
  if (rootElement || this._planes.length) {
    return rootElement;
  }

  return this.setRootElement(this.addRootElement(null));
};

/**
 * Adds a given root element and returns it.
 *
 * @param {RootLike} [rootElement] The root element to be added.
 *
 * @return {RootLike} The added root element or an implicit root element.
 */
Canvas.prototype.addRootElement = function(rootElement) {
  const idx = this._rootsIdx++;

  if (!rootElement) {
    rootElement = {
      id: '__implicitroot_' + idx,
      children: [],
      isImplicit: true
    };
  }

  const layerName = rootElement.layer = 'root-' + idx;

  this._ensureValid('root', rootElement);

  const layer = this.getLayer(layerName, PLANE_LAYER_INDEX);

  this.hideLayer(layerName);

  this._addRoot(rootElement, layer);

  this._planes.push({
    rootElement: rootElement,
    layer: layer
  });

  return rootElement;
};

/**
 * Removes a given root element and returns it.
 *
 * @param {RootLike|string} rootElement element or element ID
 *
 * @return {RootLike|undefined} removed element
 */
Canvas.prototype.removeRootElement = function(rootElement) {

  if (typeof rootElement === 'string') {
    rootElement = this._elementRegistry.get(rootElement);
  }

  const plane = this._findPlaneForRoot(rootElement);

  if (!plane) {
    return;
  }

  // hook up life-cycle events
  this._removeRoot(rootElement);

  // clean up layer
  this._removeLayer(rootElement.layer);

  // clean up plane
  this._planes = this._planes.filter(function(plane) {
    return plane.rootElement !== rootElement;
  });

  // clean up active root
  if (this._rootElement === rootElement) {
    this._rootElement = null;
  }

  return rootElement;
};


/**
 * Sets a given element as the new root element for the canvas
 * and returns the new root element.
 *
 * @param {RootLike} rootElement The root element to be set.
 *
 * @return {RootLike} The set root element.
 */
Canvas.prototype.setRootElement = function(rootElement) {

  if (rootElement === this._rootElement) {
    return;
  }

  let plane;

  if (!rootElement) {
    throw new Error('rootElement required');
  }

  plane = this._findPlaneForRoot(rootElement);

  // give set add semantics for backwards compatibility
  if (!plane) {
    rootElement = this.addRootElement(rootElement);
  }

  this._setRoot(rootElement);

  return rootElement;
};


Canvas.prototype._removeRoot = function(element) {
  const elementRegistry = this._elementRegistry,
        eventBus = this._eventBus;

  // simulate element remove event sequence
  eventBus.fire('root.remove', { element: element });
  eventBus.fire('root.removed', { element: element });

  elementRegistry.remove(element);
};


Canvas.prototype._addRoot = function(element, gfx) {
  const elementRegistry = this._elementRegistry,
        eventBus = this._eventBus;

  // resemble element add event sequence
  eventBus.fire('root.add', { element: element });

  elementRegistry.add(element, gfx);

  eventBus.fire('root.added', { element: element, gfx: gfx });
};


Canvas.prototype._setRoot = function(rootElement, layer) {

  const currentRoot = this._rootElement;

  if (currentRoot) {

    // un-associate previous root element <svg>
    this._elementRegistry.updateGraphics(currentRoot, null, true);

    // hide previous layer
    this.hideLayer(currentRoot.layer);
  }

  if (rootElement) {

    if (!layer) {
      layer = this._findPlaneForRoot(rootElement).layer;
    }

    // associate element with <svg>
    this._elementRegistry.updateGraphics(rootElement, this._svg, true);

    // show root layer
    this.showLayer(rootElement.layer);
  }

  this._rootElement = rootElement;

  this._eventBus.fire('root.set', { element: rootElement });
};

Canvas.prototype._ensureValid = function(type, element) {
  if (!element.id) {
    throw new Error('element must have an id');
  }

  if (this._elementRegistry.get(element.id)) {
    throw new Error('element <' + element.id + '> already exists');
  }

  const requiredAttrs = REQUIRED_MODEL_ATTRS[type];

  const valid = every(requiredAttrs, function(attr) {
    return typeof element[attr] !== 'undefined';
  });

  if (!valid) {
    throw new Error(
      'must supply { ' + requiredAttrs.join(', ') + ' } with ' + type);
  }
};

Canvas.prototype._setParent = function(element, parent, parentIndex) {
  collectionAdd(parent.children, element, parentIndex);
  element.parent = parent;
};

/**
 * Adds an element to the canvas.
 *
 * This wires the parent <-> child relationship between the element and
 * a explicitly specified parent or an implicit root element.
 *
 * During add it emits the events
 *
 *  * <{type}.add> (element, parent)
 *  * <{type}.added> (element, gfx)
 *
 * Extensions may hook into these events to perform their magic.
 *
 * @param {string} type
 * @param {ConnectionLike|ShapeLike} element
 * @param {ShapeLike} [parent]
 * @param {number} [parentIndex]
 *
 * @return {ConnectionLike|ShapeLike} The added element.
 */
Canvas.prototype._addElement = function(type, element, parent, parentIndex) {

  parent = parent || this.getRootElement();

  const eventBus = this._eventBus,
        graphicsFactory = this._graphicsFactory;

  this._ensureValid(type, element);

  eventBus.fire(type + '.add', { element: element, parent: parent });

  this._setParent(element, parent, parentIndex);

  // create graphics
  const gfx = graphicsFactory.create(type, element, parentIndex);

  this._elementRegistry.add(element, gfx);

  // update its visual
  graphicsFactory.update(type, element, gfx);

  eventBus.fire(type + '.added', { element: element, gfx: gfx });

  return element;
};

/**
 * Adds a shape to the canvas.
 *
 * @param {ShapeLike} shape The shape to be added
 * @param {ParentLike} [parent] The shape's parent.
 * @param {number} [parentIndex] The index at which to add the shape to the parent's children.
 *
 * @return {ShapeLike} The added shape.
 */
Canvas.prototype.addShape = function(shape, parent, parentIndex) {
  return this._addElement('shape', shape, parent, parentIndex);
};

/**
 * Adds a connection to the canvas.
 *
 * @param {ConnectionLike} connection The connection to be added.
 * @param {ParentLike} [parent] The connection's parent.
 * @param {number} [parentIndex] The index at which to add the connection to the parent's children.
 *
 * @return {ConnectionLike} The added connection.
 */
Canvas.prototype.addConnection = function(connection, parent, parentIndex) {
  return this._addElement('connection', connection, parent, parentIndex);
};


/**
 * Internal remove element
 */
Canvas.prototype._removeElement = function(element, type) {

  const elementRegistry = this._elementRegistry,
        graphicsFactory = this._graphicsFactory,
        eventBus = this._eventBus;

  element = elementRegistry.get(element.id || element);

  if (!element) {

    // element was removed already
    return;
  }

  eventBus.fire(type + '.remove', { element: element });

  graphicsFactory.remove(element);

  // unset parent <-> child relationship
  collectionRemove(element.parent && element.parent.children, element);
  element.parent = null;

  eventBus.fire(type + '.removed', { element: element });

  elementRegistry.remove(element);

  return element;
};


/**
 * Removes a shape from the canvas.
 *
 * @fires ShapeRemoveEvent
 * @fires ShapeRemovedEvent
 *
 * @param {ShapeLike|string} shape The shape or its ID.
 *
 * @return {ShapeLike} The removed shape.
 */
Canvas.prototype.removeShape = function(shape) {

  /**
   * An event indicating that a shape is about to be removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event ShapeRemoveEvent
   * @type {Object}
   * @property {ShapeLike} element The shape.
   * @property {SVGElement} gfx The graphical element.
   */

  /**
   * An event indicating that a shape has been removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event ShapeRemovedEvent
   * @type {Object}
   * @property {ShapeLike} element The shape.
   * @property {SVGElement} gfx The graphical element.
   */
  return this._removeElement(shape, 'shape');
};


/**
 * Removes a connection from the canvas.
 *
 * @fires ConnectionRemoveEvent
 * @fires ConnectionRemovedEvent
 *
 * @param {ConnectionLike|string} connection The connection or its ID.
 *
 * @return {ConnectionLike} The removed connection.
 */
Canvas.prototype.removeConnection = function(connection) {

  /**
   * An event indicating that a connection is about to be removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event ConnectionRemoveEvent
   * @type {Object}
   * @property {ConnectionLike} element The connection.
   * @property {SVGElement} gfx The graphical element.
   */

  /**
   * An event indicating that a connection has been removed from the canvas.
   *
   * @memberOf Canvas
   *
   * @event ConnectionRemovedEvent
   * @type {Object}
   * @property {ConnectionLike} element The connection.
   * @property {SVGElement} gfx The graphical element.
   */
  return this._removeElement(connection, 'connection');
};


/**
 * Returns the graphical element of an element.
 *
 * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
 * @param {boolean} [secondary=false] Whether to return the secondary graphical element.
 *
 * @return {SVGElement} The graphical element.
 */
Canvas.prototype.getGraphics = function(element, secondary) {
  return this._elementRegistry.getGraphics(element, secondary);
};


/**
 * Perform a viewbox update via a given change function.
 *
 * @param {Function} changeFn
 */
Canvas.prototype._changeViewbox = function(changeFn) {
  throw new Error('not implemented in headless bpmn-js');
};

Canvas.prototype._viewboxChanged = function() {
  this._eventBus.fire('canvas.viewbox.changed', { viewbox: this.viewbox() });
};


/**
 * Gets or sets the view box of the canvas, i.e. the
 * area that is currently displayed.
 *
 * The getter may return a cached viewbox (if it is currently
 * changing). To force a recomputation, pass `false` as the first argument.
 *
 * @example
 *
 * ```javascript
 * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
 *
 * // sets the visible area of the diagram to (100|100) -> (600|100)
 * // and and scales it according to the diagram width
 *
 * const viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
 *
 * console.log(viewbox);
 * // {
 * //   inner: Dimensions,
 * //   outer: Dimensions,
 * //   scale,
 * //   x, y,
 * //   width, height
 * // }
 *
 * // if the current diagram is zoomed and scrolled, you may reset it to the
 * // default zoom via this method, too:
 *
 * const zoomedAndScrolledViewbox = canvas.viewbox();
 *
 * canvas.viewbox({
 *   x: 0,
 *   y: 0,
 *   width: zoomedAndScrolledViewbox.outer.width,
 *   height: zoomedAndScrolledViewbox.outer.height
 * });
 * ```
 *
 * @param {Rect} [box] The viewbox to be set.
 *
 * @return {CanvasViewbox} The set viewbox.
 */
Canvas.prototype.viewbox = function(box) {
  throw new Error('not implemented in headless bpmn-js');
};


/**
 * Gets or sets the scroll of the canvas.
 *
 * @param {Point} [delta] The scroll to be set.
 *
 * @return {Point}
 */
Canvas.prototype.scroll = function(delta) {
  throw new Error('not implemented in headless bpmn-js');
};

/**
 * Scrolls the viewbox to contain the given element.
 * Optionally specify a padding to be applied to the edges.
 *
 * @param {ShapeLike|ConnectionLike|string} element The element to scroll to or its ID.
 * @param {RectTRBL|number} [padding=100] The padding to be applied. Can also specify top, bottom, left and right.
 */
Canvas.prototype.scrollToElement = function(element, padding) {
  throw new Error('not implemented in headless bpmn-js');
};

/**
 * Gets or sets the current zoom of the canvas, optionally zooming to the
 * specified position.
 *
 * The getter may return a cached zoom level. Call it with `false` as the first
 * argument to force recomputation of the current level.
 *
 * @param {number|'fit-viewport'} [newScale] The new zoom level, either a number,
 * i.e. 0.9, or `fit-viewport` to adjust the size to fit the current viewport.
 * @param {Point} [center] The reference point { x: ..., y: ...} to zoom to.
 *
 * @return {number} The set zoom level.
 */
Canvas.prototype.zoom = function(newScale, center) {
  throw new Error('not implemented in headless bpmn-js');
};

/**
 * Returns the size of the canvas.
 *
 * @return {Dimensions} The size of the canvas.
 */
Canvas.prototype.getSize = function() {
  return {
    width: 0,
    height: 0
  };
};


/**
 * Returns the absolute bounding box of an element.
 *
 * The absolute bounding box may be used to display overlays in the callers
 * (browser) coordinate system rather than the zoomed in/out canvas coordinates.
 *
 * @param {ShapeLike|ConnectionLike} element The element.
 *
 * @return {Rect} The element's absolute bounding box.
 */
Canvas.prototype.getAbsoluteBBox = function(element) {
  throw new Error('not implemented in headless bpmn-js');
};

/**
 * Fires an event so other modules can react to the canvas resizing.
 */
Canvas.prototype.resized = function() {
  this._eventBus.fire('canvas.resized');
};
