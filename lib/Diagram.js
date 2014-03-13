var DiagramJS = require('diagram-js');
var Importer = require('./Importer');

function Diagram(container) {
  this.container = container;
}

Diagram.prototype.importDefinitions = function(definitions, done) {

  this.diagram = new DiagramJS({ canvas: { container: this.container }});

  Importer.importBpmnDiagram(this.diagram, definitions, done);
};

module.exports = Diagram;