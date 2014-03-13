var DiagramJS = require('diagram-js');
var Importer = require('./Importer');

function Diagram(container) {
  this.container = container;
}

Diagram.prototype.importDefinitions = function(definitions, done) {

  if (this.diagram) {
    this.clear();
  }

  this.diagram = new DiagramJS({ canvas: { container: this.container }});

  Importer.importBpmnDiagram(this.diagram, definitions, done);
};

Diagram.prototype.clear = function() {
  this.container.innerHTML = '';
};

module.exports = Diagram;