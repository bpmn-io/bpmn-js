var FLOW_LENGTH = 50;
var HIGH_RENDER_PRIORITY = 2000;

export default function SubprocessFlows(eventBus, config) {

  var mutedStrokeColor = (config && config.mutedStrokeColor) || '#dddddd';

  function drawFakeFlows(element, parentGfx) {
    var primary = element.primaryShape;

    var drawFakeConnection = function(connection, isOutgoing) {

      var segment;
      if (isOutgoing) {
        segment = connection.waypoints.slice(0, 2);

        // Reverse order for normalizing
        segment = segment.reverse();
      } else {
        segment = connection.waypoints.slice(connection.waypoints.length - 2);
      }

      var endpoint = segment[1];

      var relativePosition = {
        x: (endpoint.x - primary.x) / primary.width,
        y: (endpoint.y - primary.y) / primary.height
      };

      var anchorPoint = {
        x: endpoint.x - (element.width * relativePosition.x),
        y: endpoint.y - (element.height * relativePosition.y)
      };

      var newWaypoints = segment.map(function(el) {
        return { x: el.x - anchorPoint.x, y: el.y - anchorPoint.y };
      });

      newWaypoints[0] = normalizeLength(newWaypoints[1], newWaypoints[0], FLOW_LENGTH);

      var attrs = {
        stroke: mutedStrokeColor
      };

      if (isOutgoing) {

        // Reverse order again for correct end marker position
        newWaypoints = newWaypoints.reverse();
      } else {

        // Remove start marker for incoming flows
        attrs.markerStart = undefined;
      }

      eventBus.fire('render.connection', {
        type: connection.type,
        gfx: parentGfx,
        element: {
          type: connection.type,
          waypoints: newWaypoints,
          di: connection.di,
          businessObject: connection.businessObject
        },
        attrs: attrs
      });
    };

    primary.incoming && primary.incoming.forEach(function(connection) {
      drawFakeConnection(connection, false);
    });

    primary.outgoing && primary.outgoing.forEach(function(connection) {
      drawFakeConnection(connection, true);
    });
  }

  eventBus.on([ 'render.shape' ], HIGH_RENDER_PRIORITY, function(evt, context) {
    var element = context.element,
        visuals = context.gfx;

    if (element.isSecondary && element.primaryShape) {
      drawFakeFlows(element, visuals);
    }

  });

}

SubprocessFlows.$inject = [ 'eventBus', 'config.subprocessFlows' ];


// helpers

function normalizeLength(fixedPoint, variablePoint, length) {
  var dx = fixedPoint.x - variablePoint.x,
      dy = fixedPoint.y - variablePoint.y,
      totalDistance = Math.abs(dx) + Math.abs(dy);

  dx = dx / totalDistance;
  dy = dy / totalDistance;

  dx *= length;
  dy *= length;

  return {
    x: fixedPoint.x - dx,
    y: fixedPoint.y - dy
  };
}
