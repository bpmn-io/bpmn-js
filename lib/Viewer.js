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

Viewer.prototype.saveXML = function(options, done) {

  if (!done) {
    done = options;
    options = {};
  }

  var definitions = this.definitions;

  if (!definitions) {
    return done(new Error('no definitions loaded'));
  }

  Model.toXML(definitions, options, function(err, xml) {
    done(err, xml);
  });
};


var SVG_HEADER =
'<?xml version="1.0" encoding="utf-8"?>\n' +
'<!-- created with bpmn-js / http://bpmn.io -->\n' +
'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1 Basic//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd">\n' +
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="basic">\n';

Viewer.prototype.saveSVG = function(options, done) {
  if (!done) {
    done = options;
    options = {};
  }

  if (!this.definitions) {
    return done(new Error('no definitions loaded'));
  }

  var svg = this.container.innerHTML;

  svg = svg.replace(/<svg[^>]+>/, SVG_HEADER);

  done(null, svg);
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