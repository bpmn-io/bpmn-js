var BpmnTreeWalker = require('./BpmnTreeWalker');

function importBpmnDiagram(diagram, definitions, done) {

  var canvas = diagram.resolve('canvas');

  var visitor = function(element, di, parent) {

    if (di.$type === 'bpmndi:BPMNShape') {
      var bounds = di.bounds;

      canvas.addShape({ id: element.id, type: element.$type, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
    }
  };

  var walker = new BpmnTreeWalker(visitor);

  walker.handleDefinitions(definitions);

  done();
}

module.exports.importBpmnDiagram = importBpmnDiagram;