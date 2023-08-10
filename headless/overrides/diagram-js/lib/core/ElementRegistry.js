/**
 * @typedef {import('./Types').ElementLike} ElementLike
 *
 * @typedef {import('./EventBus').default} EventBus
 *
 * @typedef { (element: ElementLike, gfx: SVGElement) => boolean|any } ElementRegistryFilterCallback
 * @typedef { (element: ElementLike, gfx: SVGElement) => any } ElementRegistryForEachCallback
 */

/**
 * A registry that keeps track of all shapes in the diagram.
 *
 * @class
 * @constructor
 *
 * @param {EventBus} eventBus
 */
export default function ElementRegistry(eventBus) {

  /**
   * @type { {
   *   [id: string]: {
   *     element: ElementLike;
   *     gfx?: SVGElement;
   *     secondaryGfx?: SVGElement;
   *   }
   * } }
   */
  this._elements = {};

  this._eventBus = eventBus;
}

ElementRegistry.$inject = [ 'eventBus' ];

/**
 * Add an element and its graphical representation(s) to the registry.
 *
 * @param {ElementLike} element The element to be added.
 * @param {SVGElement} gfx The primary graphical representation.
 * @param {SVGElement} [secondaryGfx] The secondary graphical representation.
 */
ElementRegistry.prototype.add = function(element, gfx, secondaryGfx) {

  var id = element.id;

  this._validateId(id);

  this._elements[id] = { element: element, gfx: gfx, secondaryGfx: secondaryGfx };
};

/**
 * Remove an element from the registry.
 *
 * @param {ElementLike|string} element
 */
ElementRegistry.prototype.remove = function(element) {
  var elements = this._elements,
      id = element.id || element,
      container = id && elements[id];

  if (container) {
    delete elements[id];
  }
};

/**
 * Update an elements ID.
 *
 * @param {ElementLike|string} element The element or its ID.
 * @param {string} newId The new ID.
 */
ElementRegistry.prototype.updateId = function(element, newId) {

  this._validateId(newId);

  if (typeof element === 'string') {
    element = this.get(element);
  }

  this._eventBus.fire('element.updateId', {
    element: element,
    newId: newId
  });

  var gfx = this.getGraphics(element),
      secondaryGfx = this.getGraphics(element, true);

  this.remove(element);

  element.id = newId;

  this.add(element, gfx, secondaryGfx);
};

/**
 * Update the graphical representation of an element.
 *
 * @param {ElementLike|string} filter The element or its ID.
 * @param {SVGElement} gfx The new graphical representation.
 * @param {boolean} [secondary=false] Whether to update the secondary graphical representation.
 */
ElementRegistry.prototype.updateGraphics = function(filter, gfx, secondary) {
  var id = filter.id || filter;

  var container = this._elements[id];

  if (secondary) {
    container.secondaryGfx = gfx;
  } else {
    container.gfx = gfx;
  }

  return gfx;
};

/**
 * Get the element with the given ID or graphical representation.
 *
 * @example
 *
 * ```javascript
 * elementRegistry.get('SomeElementId_1');
 *
 * elementRegistry.get(gfx);
 * ```
 *
 * @param {string|SVGElement} filter The elements ID or graphical representation.
 *
 * @return {ElementLike|undefined} The element.
 */
ElementRegistry.prototype.get = function(filter) {
  var id;

  if (typeof filter === 'string') {
    id = filter;
  } else {
    throw new Error('unsupported in headless bpmn-js');
  }

  var container = this._elements[id];
  return container && container.element;
};

/**
 * Return all elements that match a given filter function.
 *
 * @param {ElementRegistryFilterCallback} fn The filter function.
 *
 * @return {ElementLike[]} The matching elements.
 */
ElementRegistry.prototype.filter = function(fn) {

  var filtered = [];

  this.forEach(function(element, gfx) {
    if (fn(element, gfx)) {
      filtered.push(element);
    }
  });

  return filtered;
};

/**
 * Return the first element that matches the given filter function.
 *
 * @param {ElementRegistryFilterCallback} fn The filter function.
 *
 * @return {ElementLike|undefined} The matching element.
 */
ElementRegistry.prototype.find = function(fn) {
  var map = this._elements,
      keys = Object.keys(map);

  for (var i = 0; i < keys.length; i++) {
    var id = keys[i],
        container = map[id],
        element = container.element,
        gfx = container.gfx;

    if (fn(element, gfx)) {
      return element;
    }
  }
};

/**
 * Get all elements.
 *
 * @return {ElementLike[]} All elements.
 */
ElementRegistry.prototype.getAll = function() {
  return this.filter(function(e) { return e; });
};

/**
 * Execute a given function for each element.
 *
 * @param {ElementRegistryForEachCallback} fn The function to execute.
 */
ElementRegistry.prototype.forEach = function(fn) {

  var map = this._elements;

  Object.keys(map).forEach(function(id) {
    var container = map[id],
        element = container.element,
        gfx = container.gfx;

    return fn(element, gfx);
  });
};

/**
 * Return the graphical representation of an element.
 *
 * @example
 *
 * ```javascript
 * elementRegistry.getGraphics('SomeElementId_1');
 *
 * elementRegistry.getGraphics(rootElement); // <g ...>
 *
 * elementRegistry.getGraphics(rootElement, true); // <svg ...>
 * ```
 *
 * @param {ElementLike|string} filter The element or its ID.
 * @param {boolean} [secondary=false] Whether to return the secondary graphical representation.
 *
 * @return {SVGElement} The graphical representation.
 */
ElementRegistry.prototype.getGraphics = function(filter, secondary) {
  var id = filter.id || filter;

  var container = this._elements[id];
  return container && (secondary ? container.secondaryGfx : container.gfx);
};

/**
 * Validate an ID and throw an error if invalid.
 *
 * @param {string} id
 *
 * @throws {Error} Error indicating that the ID is invalid or already assigned.
 */
ElementRegistry.prototype._validateId = function(id) {
  if (!id) {
    throw new Error('element must have an id');
  }

  if (this._elements[id]) {
    throw new Error('element with id ' + id + ' already added');
  }
};
