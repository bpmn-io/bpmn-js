var diagramModule = require('../di').defaultModule;

// required components
require('../core/Events');


function flattenPoints(points) {
  var result = [];

  for (var i = 0, p; !!(p = points[i]); i++) {
    result.push(p.x);
    result.push(p.y);
  }

  return result;
}


/**
 * @class Renderer
 *
 * The default renderer used for shapes and connections.
 * 
 * @param {Events} events
 */
function Renderer(events) {

  function drawShape(paper, data) {
    return paper.rect(0, 0, data.width, data.height, 10, 10);
  }

  function drawConnection(paper, data) {
    var points = flattenPoints(data.waypoints);
    return paper.polyline(points);
  }

  // API
  this.drawShape = drawShape;
  this.drawConnection = drawConnection;
}

diagramModule.type('renderer', [ 'events', Renderer ]);


module.exports = Renderer;
module.exports.flattenPoints = flattenPoints;