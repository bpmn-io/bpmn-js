import {
  assign,
  isNil
} from 'min-dash';

const round = Math.round;

export default function AppendPreview(complexPreview, connectionDocking, elementFactory, eventBus, layouter, rules) {
  this._complexPreview = complexPreview;
  this._connectionDocking = connectionDocking;
  this._elementFactory = elementFactory;
  this._eventBus = eventBus;
  this._layouter = layouter;
  this._rules = rules;
}

AppendPreview.prototype.create = function(source, type, options) {
  const complexPreview = this._complexPreview,
        connectionDocking = this._connectionDocking,
        elementFactory = this._elementFactory,
        eventBus = this._eventBus,
        layouter = this._layouter,
        rules = this._rules;

  const shape = elementFactory.createShape(assign({ type: type }, options));

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
    create: [
      shape,
      connection
    ].filter((element) => !isNil(element))
  });
};

AppendPreview.prototype.delete = function() {
  this._complexPreview.delete();
};

AppendPreview.$inject = [
  'complexPreview',
  'connectionDocking',
  'elementFactory',
  'eventBus',
  'layouter',
  'rules'
];