'use strict';

var _ = require('lodash');

var Refs = require('object-refs');

var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
    labelRefs = new Refs({ name: 'label', enumerable: true }, { name: 'labelTarget' }),
    outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
    incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

/**
 * @namespace djs.model
 */

/**
 * @memberOf djs.model
 */

/**
 * The basic graphical representation
 *
 * @class
 *
 * @abstract
 */
function Base() {

  /**
   * The object that backs up the shape
   *
   * @name Base#businessObject
   * @type Object
   */
  Object.defineProperty(this, 'businessObject', {
    writable: true
  });

  /**
   * The parent shape
   *
   * @name Base#parent
   * @type Shape
   */
  parentRefs.bind(this, 'parent');

  /**
   * @name Base#label
   * @type Label
   */
  labelRefs.bind(this, 'label');

  /**
   * The list of outgoing connections
   *
   * @name Base#outgoing
   * @type Array<Connection>
   */
  outgoingRefs.bind(this, 'outgoing');

  /**
   * The list of outgoing connections
   *
   * @name Base#incoming
   * @type Array<Connection>
   */
  incomingRefs.bind(this, 'incoming');
}


/**
 * A graphical object
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
function Shape() {
  Base.call(this);

  /**
   * The list of children
   *
   * @name Shape#children
   * @type Array<Base>
   */
  parentRefs.bind(this, 'children');
}

Shape.prototype = Object.create(Base.prototype);


/**
 * A root graphical object
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
function Root() {
  Shape.call(this);
}

Root.prototype = Object.create(Shape.prototype);


/**
 * A label for an element
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
function Label() {
  Shape.call(this);

  /**
   * The labeled element
   *
   * @name Label#labelTarget
   * @type Base
   */
  labelRefs.bind(this, 'labelTarget');
}

Label.prototype = Object.create(Shape.prototype);


/**
 * A connection between two elements
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
function Connection() {
  Base.call(this);

  /**
   * The element this connection originates from
   *
   * @name Connection#source
   * @type Base
   */
  outgoingRefs.bind(this, 'source');

  /**
   * The element this connection points to
   *
   * @name Connection#target
   * @type Base
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
 * @method create
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
 * @return {Base} the new model instance
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