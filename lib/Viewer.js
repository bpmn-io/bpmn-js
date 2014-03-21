var Diagram = require('diagram-js');

var Importer = require('./Importer'),
    Model = require('./Model');

function Viewer(container) {
  this.container = container;
}

Viewer.prototype.importXML = function(xml, done) {

  var self = this;

  Model.fromXML(xml, 'bpmn:Definitions', function(err, definitions) {
    if (err) {
      return done(err);
    }

    self.importDefinitions(definitions, done);
  });
};

Viewer.prototype.importDefinitions = function(definitions, done) {

  if (this.diagram) {
    this.clear();
  }

  this.diagram = this.createDiagram();
  this.definitions = definitions;

  Importer.importBpmnDiagram(this.diagram, definitions, done);
};

Viewer.prototype.createDiagram = function() {
  return new Diagram({ canvas: { container: this.container }});
};

Viewer.prototype.clear = function() {
  this.container.innerHTML = '';
};

module.exports = Viewer;