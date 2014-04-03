var _ = require('lodash');

var BpmnTreeWalker = require('./BpmnTreeWalker'),
    Util = require('../Util');

function importBpmnDiagram(diagram, definitions, done) {

  var canvas = diagram.get('canvas');
  var events = diagram.get('eventBus');

  var visitor = {

    element: function(element, di, parent) {

      var shape;

      function fire(type, shape) {
        events.fire('bpmn.element.' + type, {
          semantic: element, di: di, diagramElement: shape
        });
      }

      if (di.$type === 'bpmndi:BPMNShape') {
        var bounds = di.bounds;

        shape = {
          id: element.id, type: element.$type,
          x: bounds.x, y: bounds.y,
          width: bounds.width, height: bounds.height,
          parent: parent
        };

        fire('add', shape);
        canvas.addShape(shape);
      } else {

        var waypoints = _.collect(di.waypoint, function(p) {
          return { x: p.x, y: p.y };
        });

        shape = { id: element.id, type: element.$type, waypoints: waypoints };

        fire('add', shape);
        canvas.addConnection(shape);
      }

      fire('added', shape);

      return shape;
    },
    
    error: function(message, context) {
      console.warn('[import]', message, context);
    }
  };

  var walker = new BpmnTreeWalker(visitor);
  walker.handleDefinitions(definitions);
  
  done();
}

module.exports.importBpmnDiagram = Util.failSafeAsync(importBpmnDiagram);