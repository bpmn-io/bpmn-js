

function ReconnectConnectionHandler(layouter) { }

ReconnectConnectionHandler.$inject = [ 'layouter' ];

module.exports = ReconnectConnectionHandler;

ReconnectConnectionHandler.prototype.execute = function(context) {

  var newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection;

  if (!newSource && !newTarget) {
    throw new Error('newSource or newTarget are required');
  }

  if (newSource && newTarget) {
    throw new Error('must specify either newSource or newTarget');
  }

  if (newSource) {
    context.oldSource = connection.source;
    connection.source = newSource;

    context.oldDockingPoint = connection.waypoints[0];
    connection.waypoints[0] = context.dockingPoint;
  }

  if (newTarget) {
    context.oldTarget = connection.target;
    connection.target = newTarget;

    context.oldDockingPoint = connection.waypoints[connection.waypoints.length - 1];
    connection.waypoints[connection.waypoints.length - 1] = context.dockingPoint;
  }

  return connection;
};

ReconnectConnectionHandler.prototype.revert = function(context) {

  var newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection;

  if (newSource) {
    connection.source = context.oldSource;
    connection.waypoints[0] = context.oldDockingPoint;
  }

  if (newTarget) {
    connection.target = context.oldTarget;
    connection.waypoints[connection.waypoints.length - 1] = context.oldDockingPoint;
  }

  return connection;
};