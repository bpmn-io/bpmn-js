import {
  assign,
  isNil
} from 'min-dash';

const round = Math.round;

/**
 * @typedef {import('diagram-js/lib/features/complex-preview/ComplexPreview').default} ComplexPreview
 * @typedef {import('diagram-js/lib/layout/ConnectionDocking').default} ConnectionDocking
 * @typedef {import('../modeling/ElementFactory').default} ElementFactory
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/layout/ManhattanLayout').default} ManhattanLayout
 * @typedef {import('diagram-js/lib/features/rules/Rules').default} Rules
 *
 * @typedef {import('../../model/Types').Shape} Shape
 */

/**
 * A preview for appending.
 *
 * @param {ComplexPreview} complexPreview
 * @param {ConnectionDocking} connectionDocking
 * @param {ElementFactory} elementFactory
 * @param {EventBus} eventBus
 * @param {ManhattanLayout} layouter
 * @param {Rules} rules
 */
export default function AppendPreview(complexPreview, connectionDocking, elementFactory, eventBus, layouter, rules) {
  this._complexPreview = complexPreview;
  this._connectionDocking = connectionDocking;
  this._elementFactory = elementFactory;
  this._eventBus = eventBus;
  this._layouter = layouter;
  this._rules = rules;
}

/**
 * Create a preview of appending a shape of the given type to the given source.
 *
 * @param {Shape} source
 * @param {string} type
 * @param {Partial<Shape>} options
 */
AppendPreview.prototype.create = function(source, type, options) {
  const complexPreview = this._complexPreview,
        connectionDocking = this._connectionDocking,
        elementFactory = this._elementFactory,
        eventBus = this._eventBus,
        layouter = this._layouter,
        rules = this._rules;

  const shape = elementFactory.createShape(assign({ type }, options));

  const position = eventBus.fire('autoPlace', {
    source,
    shape
  });

  if (!position) {
    return;
  }

  assign(shape, {
    x: position.x - round(shape.width / 2),
    y: position.y - round(shape.height / 2)
  });

  const connectionCreateAllowed = rules.allowed('connection.create', {
    source,
    target: shape,
    hints: {
      targetParent: source.parent
    }
  });

  let connection = null;

  if (connectionCreateAllowed) {
    connection = elementFactory.createConnection(connectionCreateAllowed);

    connection.waypoints = layouter.layoutConnection(connection, {
      source,
      target: shape
    });

    connection.waypoints = connectionDocking.getCroppedWaypoints(connection, source, shape);
  }

  complexPreview.create({
    created: [
      shape,
      connection
    ].filter((element) => !isNil(element))
  });
};

AppendPreview.prototype.cleanUp = function() {
  this._complexPreview.cleanUp();
};

AppendPreview.$inject = [
  'complexPreview',
  'connectionDocking',
  'elementFactory',
  'eventBus',
  'layouter',
  'rules'
];