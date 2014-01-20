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

  function wrap(paper, gfx) {

    // append djs-visual to the element
    gfx.attr('class', (gfx.attr('class') || '') + ' djs-visual');

    return paper.group(gfx);
  }

  function createShape(paper, data) {

    var rect = paper.rect(data.x, data.y, data.width, data.height, 10, 10)
                    .attr({ 'class': 'djs-shape' });

    var group = wrap(paper, rect);

    return rect;
  }

  function createConnection(paper, data) {
    var points = flatenPoints(data.waypoints);

    var line = paper
      .polyline(points)
      .attr({ 'class': 'djs-connection' });

    var group = wrap(paper, line);

    return line;
  }

  return {
    createConnection: createConnection,
    createShape: createShape
  };
}

module.exports = SvgFactory;