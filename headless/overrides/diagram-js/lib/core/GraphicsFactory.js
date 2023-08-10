/**
 * @typedef {import('./Types').ConnectionLike} ConnectionLike
 * @typedef {import('./Types').ElementLike} ElementLike
 * @typedef {import('./Types').ShapeLike} ShapeLike
 *
 * @typedef {import('./ElementRegistry').default} ElementRegistry
 * @typedef {import('./EventBus').default} EventBus
 */

/**
 * A factory that creates graphical elements,
 * but does so in a headless compatible way.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default function GraphicsFactory(eventBus, elementRegistry) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
}

GraphicsFactory.$inject = [ 'eventBus' , 'elementRegistry' ];

/**
 * Create a graphical element.
 *
 * @param { 'shape' | 'connection' | 'label' | 'root' } type The type of the element.
 * @param {ElementLike} element The element.
 * @param {number} [parentIndex] The index at which to add the graphical element to its parent's children.
 *
 * @return {SVGElement} The graphical element.
 */
GraphicsFactory.prototype.create = function(type, element, parentIndex) {
  return {};
};

/**
 * Update the containments of the given elements.
 *
 * @param {ElementLike[]} elements The elements.
 */
GraphicsFactory.prototype.updateContainments = function(elements) {

};

/**
 * Draw a shape.
 *
 * @param {SVGElement} visual The graphical element.
 * @param {ShapeLike} element The shape.
 *
 * @return {SVGElement}
 */
GraphicsFactory.prototype.drawShape = function(visual, element) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.shape', { gfx: visual, element: element });
};

/**
 * Get the path of a shape.
 *
 * @param {ShapeLike} element The shape.
 *
 * @return {string} The path of the shape.
 */
GraphicsFactory.prototype.getShapePath = function(element) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.getShapePath', element);
};

/**
 * Draw a connection.
 *
 * @param {SVGElement} visual The graphical element.
 * @param {ConnectionLike} element The connection.
 *
 * @return {SVGElement}
 */
GraphicsFactory.prototype.drawConnection = function(visual, element) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.connection', { gfx: visual, element: element });
};

/**
 * Get the path of a connection.
 *
 * @param {ConnectionLike} connection The connection.
 *
 * @return {string} The path of the connection.
 */
GraphicsFactory.prototype.getConnectionPath = function(connection) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.getConnectionPath', connection);
};

/**
 * Update an elements graphical representation.
 *
 * @param {'shape'|'connection'} type
 * @param {ElementLike} element
 * @param {SVGElement} gfx
 */
GraphicsFactory.prototype.update = function(type, element, gfx) {

};

/**
 * Remove a graphical element.
 *
 * @param {ElementLike} element The element.
 */
GraphicsFactory.prototype.remove = function(element) {

};