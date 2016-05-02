'use strict';

var forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map'),
    sortBy = require('lodash/collection/sortBy'),
    clone = require('lodash/lang/clone');

var inherits = require('inherits');



function removeProperties(element, properties) {
  forEach(properties, function(prop) {
    if (element[prop]) {
      delete element[prop];
    }
  });
}

/**
 * A handler that implements pasting of elements onto the diagram.
 *
 * @param {eventBus} EventBus
 * @param {canvas} Canvas
 * @param {selection} Selection
 * @param {elementFactory} ElementFactory
 * @param {modeling} Modeling
 * @param {rules} Rules
 */
function PasteHandler(eventBus, canvas, selection, elementFactory, modeling, rules) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._selection = selection;
  this._elementFactory = elementFactory;
  this._modeling = modeling;
  this._rules = rules;
}

inherits(PasteHandler, require('./NoopHandler'));


PasteHandler.$inject = [
  'eventBus',
  'canvas',
  'selection',
  'elementFactory',
  'modeling',
  'rules'
];

module.exports = PasteHandler;


////// api /////////////////////////////////////////////

/**
 * Creates a new shape
 *
 * @param {Object} context
 * @param {Object} context.tree the new shape
 * @param {Element} context.topParent the paste target
 */
PasteHandler.prototype.preExecute = function(context) {
  var eventBus = this._eventBus;

  var tree = context.tree,
      topParent = context.topParent,
      position = context.position;

  tree.createdElements = {};

  tree.labels = [];

  forEach(tree, function(elements, depthStr) {
    var depth = parseInt(depthStr, 10);

    if (isNaN(depth)) {
      return;
    }

    // set the parent on the top level elements
    if (!depth) {
      elements = map(elements, function(descriptor) {
        descriptor.parent = topParent;

        return descriptor;
      });
    }

    // Order by priority for element creation
    elements = sortBy(elements, 'priority');

    forEach(elements, function(descriptor) {
      var id = descriptor.id,
          parent = descriptor.parent,
          isAttach = false,
          hints,
          newPosition;

      var element = clone(descriptor);

      if (depth) {
        element.parent = this._getCreatedElement(parent, tree);
      }

      // this happens when shapes have not been created due to rules
      if (!parent) {
        return;
      }

      eventBus.fire('element.paste', {
        createdElements: tree.createdElements,
        descriptor: element
      });

      // in case the parent changed during 'element.paste'
      parent = element.parent;

      if (element.waypoints) {
        element = this._createConnection(element, parent, position, tree);

        if (element) {
          tree.createdElements[id] = {
            element: element,
            descriptor: descriptor
          };
        }

        return;
      }

      // supply not-root information as hint
      if (element.parent !== topParent) {
        hints = { root: false };
      }

      // set host
      if (element.host) {
        isAttach = true;

        parent = this._getCreatedElement(element.host, tree);
      }

      // handle labels
      if (element.labelTarget) {
        return tree.labels.push(element);
      }

      newPosition = {
        x: Math.round(position.x + element.delta.x + (element.width / 2)),
        y: Math.round(position.y + element.delta.y + (element.height / 2))
      };

      removeProperties(element, [ 'id', 'parent', 'delta', 'host', 'priority' ]);

      element = this._createShape(element, parent, newPosition, isAttach, hints);

      if (element) {
        tree.createdElements[id] = {
          element: element,
          descriptor: descriptor
        };
      }
    }, this);
  }, this);
};

// move label's to their relative position
PasteHandler.prototype.postExecute = function(context) {
  var modeling = this._modeling,
      selection = this._selection;

  var tree = context.tree,
      labels = tree.labels,
      pastedElements;

  forEach(labels, function(labelDescriptor) {
    var labelTarget = this._getCreatedElement(labelDescriptor.labelTarget, tree),
        label, labelTargetPos, newPosition;

    if (!labelTarget) {
      return;
    }

    label = labelTarget.label;

    if (!label) {
      return;
    }

    labelTargetPos = {
      x: labelTarget.x,
      y: labelTarget.y
    };

    if (labelTarget.waypoints) {
      labelTargetPos = labelTarget.waypoints[0];
    }

    newPosition = {
      x: Math.round((labelTargetPos.x - label.x) + labelDescriptor.delta.x),
      y: Math.round((labelTargetPos.y - label.y) + labelDescriptor.delta.y)
    };

    modeling.moveShape(label, newPosition, labelTarget.parent);
  }, this);

  pastedElements = map(tree.createdElements, function(data) {
    return data.element;
  });

  selection.select(pastedElements);
};


PasteHandler.prototype._createConnection = function(element, parent, parentCenter, tree) {
  var modeling = this._modeling,
      rules = this._rules;

  var connection, source, target, canPaste;

  element.waypoints = map(element.waypoints, function(waypoint, idx) {
    return {
      x: Math.round(parentCenter.x + element.delta[idx].x),
      y: Math.round(parentCenter.y + element.delta[idx].y)
    };
  });

  source = this._getCreatedElement(element.source, tree);
  target = this._getCreatedElement(element.target, tree);

  if (!source || !target) {
    return null;
  }

  canPaste = rules.allowed('element.paste', {
    source: source,
    target: target
  });

  if (!canPaste) {
    return null;
  }

  removeProperties(element, [ 'id', 'parent', 'delta', 'source', 'target', 'width', 'height', 'priority' ]);

  connection = modeling.createConnection(source, target, element, parent);

  return connection;
};


PasteHandler.prototype._createShape = function(element, parent, position, isAttach, hints) {
  var modeling = this._modeling,
      elementFactory = this._elementFactory,
      rules = this._rules;

  var canPaste = rules.allowed('element.paste', {
    element: element,
    position: position,
    parent: parent
  });

  if (!canPaste) {
    return null;
  }

  var shape = elementFactory.createShape(element);

  modeling.createShape(shape, position, parent, isAttach, hints);

  return shape;
};


PasteHandler.prototype._getCreatedElement = function(id, tree) {
  return tree.createdElements[id] && tree.createdElements[id].element;
};
