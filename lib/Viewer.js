var Diagram = require('diagram-js');
var Importer = require('./Importer');

function Viewer(container) {
  this.container = container;
}

Viewer.prototype.importDefinitions = function(definitions, done) {

  if (this.diagram) {
    this.clear();
  }

  this.diagram = this.createDiagram();
  this.definitions = definitions;

  Importer.importBpmnDiagram(this.diagram, definitions, done);
};


Viewer.prototype.exportDefinitions = function(done) {

};

Viewer.prototype.createDiagram = function() {
  return new Diagram({ canvas: { container: this.container }});
};

Viewer.prototype.clear = function() {
  this.container.innerHTML = '';
};

module.exports = Viewer;