var snap = require('snapsvg');

function SvgFactory(events) {

  var markers;

  function addMarker(id, element) {
    if (!markers) {
      markers = {};
    }

    markers[id] = element.attr({ id: id });
  }

  function initMarkers(paper) {

    addMarker('sequenceflow-end-marker',
      paper
        .path("M 0 0 L 10 5 L 0 10 Z")
          .attr('class', 'djs-connection-marker')
          .marker(0, 0, 10, 10, 10, 5)
            .attr({
              markerUnits: 'strokeWidth',
              markerWidth: 10,
              markerHeight: 6,
              orient: 'auto',
              overflow: 'visible'
            }));

  //   addMarker('sequenceFlowEnd',
  //     paper
  //       .path("M 0 0 L 10 5 L 0 10")
  //       .marker(0, 0, 10, 10, 0, 5)
  //         .attr({
  //           markerUnits: 'strokeWidth',
  //           markerWidth: 5,
  //           markerHeight: 3,
  //           orient: auto,
  //           overflow: 'visible'
  //         }));

  //   <marker id="starttriangle" overflow="visible"
  // viewBox="0 0 10 10" refX="5" refY="5" 
  // markerUnits="strokeWidth"
  // markerWidth="2" markerHeight="3"
  // orient="auto">
  //   <path d="M -2 5 L 8 0 L 8 10" />
  //   </marker>
  }

  events.on('canvas.init', function(event) {
    var paper = event.paper;

    initMarkers(paper);
  });

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

SvgFactory.$inject = [ 'events' ];

module.exports = SvgFactory;