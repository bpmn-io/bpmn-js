var Diagram = require('diagram-js');
var Importer = require('./Importer');

function Renderer(container) {
  this.container = container;
}

Renderer.prototype.importDefinitions = function(definitions, done) {

  if (this.diagram) {
    this.clear();
  }

  this.diagram = this.createDiagram();
  this.definitions = definitions;

  Importer.importBpmnDiagram(this.diagram, definitions, done);
};


Renderer.prototype.exportDefinitions = function(done) {

};

Renderer.prototype.createDiagram = function() {
  return new Diagram({ canvas: { container: this.container }});
};

Renderer.prototype.clear = function() {
  this.container.innerHTML = '';
};

module.exports = Renderer;