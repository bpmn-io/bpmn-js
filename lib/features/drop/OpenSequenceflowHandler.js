'use strict';

var _ = require('lodash');

var self;
function OpenSequenceflowHandler(modeling) {

  self = this;
  this._modeling = modeling;
}

OpenSequenceflowHandler.$inject = [ 'modeling' ];

module.exports = OpenSequenceflowHandler;


/**
 * Removes sequence flows that source or target does not have same parent.
 */
OpenSequenceflowHandler.prototype.execute = function(context) {

  var shapes       = context.shapes,
      connections  = context.connections,
      target       = context.target;

  self._removeConnections(shapes, connections, target);
};


OpenSequenceflowHandler.prototype._removeConnections = function(shapes, connections, target) {

  var modeling = self._modeling;

  var removeableConnections = getRemoveableConnections(shapes, connections);

  _.forEach(removeableConnections, function(connection) {

    var sourceParent = connection.source.parent,
        targetParent = connection.target.parent;

    if (sourceParent.id !== targetParent.id) {
      delete connections[connection.id];
      modeling.removeConnection(connection);
    }
  });
};

function getRemoveableConnections(shapes, connections) {

  var connectionsToRemove = {};

  _.forEach(shapes, function(shape) {

    var allConnections = _.union(shape.incoming, shape.outgoing);

    _.forEach(allConnections, function(connection) {
      // if one of the connection endpoints points to a shape that is not part of the map
      // delete the connection
      if (!(shapes[connection.source.id] && shapes[connection.target.id])) {
        connectionsToRemove[connection.id] = connection;
      }
    });

  });

  return connectionsToRemove;
}
