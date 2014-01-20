var snap = require('snapsvg');

function SvgFactory() {

  function flatenPoints(points) {
    var result = [];

    for (var i = 0, p; !!(p = points[i]); i++) {
      result.push(p.x);
      result.push(p.y);
    }

    return result;
  }

  function createConnection(container, data) {
    return container.polyline(flatenPoints(data.waypoints));
  }

  function createShape(container, data) {
    return container.rect(data.x, data.y, data.width, data.height);
  }

  return {
    createConnection: createConnection,
    createShape: createShape
  };
}

module.exports = SvgFactory;