'use strict';

var _     = require('lodash');
var model = require('../../model');



function Drop(eventBus, rules, elementRegistry, modeling) {

  this._eventBus         = eventBus;
  this._rules            = rules;
  this._elementRegistry  = elementRegistry;
  this._modeling         = modeling;
  this._afterDropActions = {};
}

Drop.$inject = [ 'eventBus', 'rules', 'elementRegistry', 'modeling' ];

module.exports = Drop;


Drop.prototype.dropElements = function(context) {

  var target      = context.newParent,
      shapes      = context.shapes || {},
      connections = context.connections || {},
      oldParents  = context.oldParents || (context.oldParents = {});

  if (!target) {
    return true;
  }

  // create map of shapes and connections
  _.forEach(context.shapes, function(shape) {

    shapes[shape.id] = shape;
  });

  _.forEach(context.connections, function(connection) {

      connections[connection.id] = connection;
  });

  var dropAllowed = this._isDropAllowed(shapes, connections, target);

  filterElements(shapes, connections);

  if (!dropAllowed) {
    return true;
  }

  this._changeParent(shapes, connections, target, oldParents);

  // Run diagram specific actions
  _.forEach(this._afterDropActions,function(action) {

    var context = {
      target: target,
      shapes: shapes,
      connections: connections
    };

    action(context);
  });

  return true;
};

/**
 * A diagram implementation can register register handlers that execute
 * actions specific to the diagram type after the drop is finished.
 */
Drop.prototype.registerAfterDropAction = function(name, handler) {
  this._afterDropActions[name] = handler;
};


/**
 * Move element1 behind element2 so that it is rendered above.
 */
Drop.prototype._moveElementBehind = function(element1, element2) {

  var elementRegistry = this._elementRegistry;

  // No ordering if the root element is involved
  if (element2 instanceof model.Root) {
    return;
  }

  var svg1 = elementRegistry.getGraphics(element1).node;
  var svg2 = elementRegistry.getGraphics(element2).node;

  svg2.parentNode.insertBefore(svg1, svg2.nextSibling);
};


/**
 * Change parent of the passed in elements to target. Including updating the SVG.
 */
Drop.prototype._changeParent = function(shapes, connections, target, oldParents) {

  var elementRegistry = this._elementRegistry;

  var self     = this,
      elements = _.union(_.values(shapes), _.values(connections));

  _.forEach(elements, function(element) {

    element = elementRegistry.get(element.id);
    oldParents[element.id] = element.parent;
    element.parent = target;
  });


  // Moves all childrens of a container behind the container
  function orderContainerContent(container) {

    var children = container.children;

    _.forEach(children, function(child) {

      var element = elementRegistry.get(child.id);

      self._moveElementBehind(element, container);

      orderContainerContent(child);
    });
  }
  orderContainerContent(target);
};


Drop.prototype.revert = function(context) {

  var shapes     = context.shapes,
      oldParents = context.oldParents,
      newParent  = context.newParent;

  // Reset parent only if parent was changed
  if (newParent && oldParents) {
    _.forEach(shapes, function(shape) {
      debugger;
      shape.parent = oldParents[shape.id];
    });
  }
};


Drop.prototype.getNewParent = function(shape, context) {
  return context.newParent || shape.parent;
};


Drop.prototype._isDropAllowed = function (shapes, connections, target) {

  var rules = this._rules;

  var isShapeAllowed = rules.can('drop', {
    source: shapes,
    target: target
  });

  var isConnectionAllowed = rules.can('drop', {
    source: connections,
    target: target
  });

  return isShapeAllowed && isConnectionAllowed;
};


//-----private Helper methods

/**
 * Removes that elements where the parent is already in the list.
 */
function filterElements(shapes, connections) {


  function filter(elements) {

    var elementsToRemove = [];

    // search for elements that are already handeld by their parent
    _.forEach(elements, function(element) {

      var parent = element.parent;
      if (shapes[parent.id]) {
        elementsToRemove.push(element);
      }
    });

    // removes them from the list of elements that need to be moved to a new parent
    _.forEach(elementsToRemove, function(element) {
      delete elements[element.id];
    });
  }

  filter(connections);
  filter(shapes);
}
