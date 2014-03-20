var components = require('../di').defaultModule;

// required components
require('./Events');
require('../draw/Snap');

function GraphicsFactory(events, Snap) {

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
        .path('M 0 0 L 10 5 L 0 10 Z')
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
  //       .path('M 0 0 L 10 5 L 0 10')
  //       .marker(0, 0, 10, 10, 0, 5)
  //         .attr({
  //           markerUnits: 'strokeWidth',
  //           markerWidth: 5,
  //           markerHeight: 3,
  //           orient: auto,
  //           overflow: 'visible'
  //         }));

  //   <marker id='starttriangle' overflow='visible'
  // viewBox='0 0 10 10' refX='5' refY='5' 
  // markerUnits='strokeWidth'
  // markerWidth='2' markerHeight='3'
  // orient='auto'>
  //   <path d='M -2 5 L 8 0 L 8 10' />
  //   </marker>
  }

  events.on('canvas.init', function(event) {
    var paper = event.paper;

    initMarkers(paper);
  });

  function flattenPoints(points) {
    var result = [];

    for (var i = 0, p; !!(p = points[i]); i++) {
      result.push(p.x);
      result.push(p.y);
    }

    return result;
  }

  function wrap(paper, gfx, type) {

    // append djs-visual to the element
    gfx.addClass('djs-visual');

    return paper
             .group(gfx)
               .addClass('djs-group')
               .addClass('djs-' + type);
  }

  function createShape(paper, data) {

    var rect = paper.rect(0, 0, data.width, data.height, 10, 10);
    var group = wrap(paper, rect, 'shape');

    setPosition(group, data.x, data.y);

    return group;
  }

  function createConnection(paper, data) {
    var points = flattenPoints(data.waypoints);

    var line = paper.polyline(points);

    var group = wrap(paper, line, 'connection');

    return group;
  }

  function setPosition(rect, x, y) {
    var positionMatrix = new Snap.Matrix();
    positionMatrix.translate(x, y);
    rect.transform(positionMatrix);
  }

  function createPaper(options) {
    return Snap.createSnapAt(options.width, options.height, options.container);
  }
  
  // API
  this.createConnection = createConnection;
  this.createShape = createShape;
  this.createPaper = createPaper;
}

components.type('graphicsFactory', [ 'events', 'Snap', GraphicsFactory ]);

module.exports = GraphicsFactory;