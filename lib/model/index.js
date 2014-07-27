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
 * The basic graphical representation
 *
 * @class djs.model.Base
 * @memberOf djs.model
 * @constructor
 *
 * @abstract
 */
function Base() {

  /**
   * The object that backs up the shape
   *
   * @instance
   * @member {Object} businessObject
   * @memberOf djs.model.Base
   */
  Object.defineProperty(this, 'businessObject', {
    writable: true
  });

  /**
   * @instance
   * @member {djs.model.Shape} parent
   * @memberOf djs.model.Base
   */
  parentRefs.bind(this, 'parent');

  /**
   * @instance
   * @member {djs.model.Label} label
   * @memberOf djs.model.Base
   */
  labelRefs.bind(this, 'label');

  /**
   * The list of outgoing connections
   *
   * @instance
   * @member {Array<djs.model.Connection>} outgoing
   * @memberOf djs.model.Base
   */
  outgoingRefs.bind(this, 'outgoing');

  /**
   * The list of outgoing connections
   *
   * @instance
   * @member {Array<djs.model.Connection>} incoming
   * @memberOf djs.model.Base
   */
  incomingRefs.bind(this, 'incoming');
}


/**
 * A graphical object
 *
 * @class djs.model.Shape
 * @memberOf djs.model
 * @constructor
 *
 * @augments {djs.model.Base}
 */
function Shape() {
  Base.call(this);

  /**
   * The list of children
   *
   * @instance
   * @member {Array<djs.model.Base>} children
   * @memberOf djs.model.Shape
   */
  parentRefs.bind(this, 'children');
}

Shape.prototype = Object.create(Base.prototype);


/**
 * The root graphical object
 *
 * @class djs.model.Root
 * @memberOf djs.model
 * @constructor
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
 * @memberOf djs.model
 * @constructor
 *
 * @augments {djs.model.Shape}
 */
function Label() {
  Shape.call(this);

  /**
   * The labeled element
   *
   * @instance
   * @member {djs.model.Base} labelTarget
   * @memberOf djs.model.Label
   */
  labelRefs.bind(this, 'labelTarget');
}

Label.prototype = Object.create(Shape.prototype);


/**
 * A connection between two elements
 *
 * @class djs.model.Connection
 * @memberOf djs.model
 * @constructor
 *
 * @augments {djs.model.Base}
 */
function Connection() {
  Base.call(this);

  /**
   * The element this connection originates from
   *
   * @instance
   * @member {djs.model.Base} source
   * @memberOf djs.model.Connection
   */
  outgoingRefs.bind(this, 'source');

  /**
   * The element this connection points to
   *
   * @instance
   * @member {djs.model.Base} target
   * @memberOf djs.model.Connection
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
 * @memberOf djs.model
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