'use strict';

var _ = require('lodash');

var Refs = require('object-refs');

var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
    labelRefs = new Refs({ name: 'label', enumerable: true }, { name: 'labelTarget' }),
    outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
    incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

/**
 * The basic graphical representation
 *
 * @class djs.model.Base
 *
 * @abstract
 */
function Base() {

  /**
   * @property {Object} businessObject the object that backs up the shape
   */
  Object.defineProperty(this, 'businessObject', {
    writable: true
  });

  /**
   * @property {djs.model.Shape} parent
   */
  parentRefs.bind(this, 'parent');

  /**
   * @property {djs.model.Label} label
   */
  labelRefs.bind(this, 'label');

  /**
   * @property {Array<djs.model.Connection>} outgoing the list of incoming connections
   */
  outgoingRefs.bind(this, 'outgoing');

  /**
   * @property {Array<djs.model.Connection>} incoming the list of outgoing connections
   */
  incomingRefs.bind(this, 'incoming');
}


/**
 * A graphical object
 *
 * @class djs.model.Shape
 *
 * @augments {djs.model.Base}
 */
function Shape() {
  Base.call(this);

  /**
   * @property {Array<djs.model.Base>} children list of children
   */
  parentRefs.bind(this, 'children');
}

Shape.prototype = Object.create(Base.prototype);


/**
 * The root graphical object
 *
 * @class djs.model.Root
 *
 * @augments {djs.model.Shape}
 */
function Root() {
  Shape.call(this);
}

Root.prototype = Object.create(Shape.prototype);


/**
 * A label for an element
 *
 * @class djs.model.Label
 *
 * @augments {djs.model.Shape}
 */
function Label() {
  Shape.call(this);

  /**
   * @property {djs.model.Base} labelTarget the element labeled
   */
  labelRefs.bind(this, 'labelTarget');
}

Label.prototype = Object.create(Shape.prototype);


/**
 * A connection between two elements
 *
 * @class djs.model.Connection
 *
 * @augments {djs.model.Base}
 */
function Connection() {
  Base.call(this);

  /**
   * @property {djs.model.Base} source the element this connection originates from
   */
  outgoingRefs.bind(this, 'source');

  /**
   * @property {djs.model.Base} target the element this connection points to
   */
  incomingRefs.bind(this, 'target');
}

Connection.prototype = Object.create(Base.prototype);


var types = {
  connection: Connection,
  shape: Shape,
  label: Label,
  root: Root
};

/**
 * Creates a new model element of the specified type
 *
 * @example
 *
 * var shape1 = Model.create('shape', { x: 10, y: 10, width: 100, height: 100 });
 * var shape2 = Model.create('shape', { x: 210, y: 210, width: 100, height: 100 });
 *
 * var connection = Model.create('connection', { waypoints: [ { x: 110, y: 55 }, {x: 210, y: 55 } ] });
 *
 * @param  {String} type lower-cased model name
 * @param  {Object} attrs attributes to initialize the new model instance with
 *
 * @return {djs.model.Base} the new model instance
 */
module.exports.create = function(type, attrs) {
  var Type = types[type];
  if (!Type) {
    throw new Error('unknown type: <' + type + '>');
  }
  return _.extend(new Type(), attrs);
};


module.exports.Root = Root;
module.exports.Shape = Shape;
module.exports.Connection = Connection;
module.exports.Label = Label;