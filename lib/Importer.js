var _ = require('lodash');

var BpmnTreeWalker = require('./BpmnTreeWalker');

function importBpmnDiagram(diagram, definitions, done) {

  var canvas = diagram.get('canvas');

  var shapes = {};

  var visitor = function(element, di, parent) {

    var shape;

    if (di.$type === 'bpmndi:BPMNShape') {
      var bounds = di.bounds;

      shape = { id: element.id, type: element.$type, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, parent: parent };

      canvas.addShape(shape);
    } else {

      var waypoints = _.collect(di.waypoint, function(p) {
        return { x: p.x, y: p.y };
      });

      shape = { id: element.id, type: element.$type, waypoints: waypoints };
      canvas.addConnection(shape);
    }

    shapes[element.id] = shape;

    return shape;
  };

  var walker = new BpmnTreeWalker(visitor);

  walker.handleDefinitions(definitions);

  done();
}

module.exports.importBpmnDiagram = importBpmnDiagram;