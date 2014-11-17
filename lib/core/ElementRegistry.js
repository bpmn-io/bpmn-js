/**
 * @class
 *
 * A registry that keeps track of all shapes in the diagram.
 */
function ElementRegistry() {
  this._elements = {};
}

module.exports = ElementRegistry;

/**
 * Register a pair of (element, gfx).
 *
 * @param {djs.model-Base} element
 * @param {SVGElement} gfx
 */
ElementRegistry.prototype.add = function(element, gfx) {

  var eid = element.id;

  if (!eid) {
    throw new Error('element must have an id');
  }

  if (this._elements[eid]) {
    throw new Error('element with id ' + eid + ' already added');
  }

  this._elements[eid] = { element: element, gfx: gfx };
};


/**
 * Removes an element from the registry.
 *
 * @param {djs.model.Base} element
 */
ElementRegistry.prototype.remove = function(element) {
  var id = element.id || element;

  if (id) {
    delete this._elements[element.id];
  }
};


/**
 * Return the model element for a given id or graphics.
 *
 * @example
 *
 * elementRegistry.get('SomeElementId_1');
 * elementRegistry.get(gfx);
 *
 *
 * @param {String|SVGElement} filter for selecting the element
 *
 * @return {djs.model.Base}
 */
ElementRegistry.prototype.get = function(filter) {
  var id;

  if (typeof filter === 'string') {
    id = filter;
  } else {
    id = filter && filter.attr('data-element-id');
  }

  var container = this._elements[id];
  return container && container.element;
};

/**
 * Return all elements that match a given filter function.
 *
 * @param {Function} fn
 *
 * @return {Array<djs.model.Base>}
 */
ElementRegistry.prototype.filter = function(fn) {

  var map = this._elements,
      filtered = [];

  Object.keys(map).forEach(function(id) {
    var container = map[id],
        element = container.element,
        gfx = container.gfx;

    if (fn(element, gfx)) {
      filtered.push(element);
    }
  });

  return filtered;
};

/**
 * Return the graphics for a given id or element.
 *
 * @example
 *
 * elementRegistry.getGraphics('SomeElementId_1');
 * elementRegistry.getGraphics(rootElement);
 *
 *
 * @param {String|djs.model.Base} filter
 *
 * @return {SVGElement}
 */
ElementRegistry.prototype.getGraphics = function(filter) {
  var id = filter.id || filter;

  var container = this._elements[id];
  return container && container.gfx;
};

/**
 * Returns the root element on the canvas.
 */
ElementRegistry.prototype.getRoot = function() {
  return this.filter(function(element) {
    return !element.parent;
  });
};
