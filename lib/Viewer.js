var Diagram = require('diagram-js');

var Importer = require('./import/Importer'),
    BpmnModel = require('bpmn-moddle'),
    failSafeAsync = require('./Util').failSafeAsync;


function initListeners(diagram, listeners) {
  var events = diagram.get('eventBus');

  listeners.forEach(function(l) {
    events.on(l.event, l.handler);
  });
}

function Viewer(container) {
  this.container = container;
}

Viewer.prototype.importXML = function(xml, done) {

  var self = this;

  BpmnModel.fromXML(xml, 'bpmn:Definitions', function(err, definitions) {
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

  BpmnModel.toXML(definitions, options, function(err, xml) {
    done(err, xml);
  });
};


var SVG_HEADER =
'<?xml version="1.0" encoding="utf-8"?>\n' +
'<!-- created with bpmn-js / http://bpmn.io -->\n' +
'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1 Basic//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd">\n' +
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
     'version="1.1" baseProfile="basic">\n';

var SVG_FOOTER = '</svg>';

Viewer.prototype.saveSVG = function(options, done) {
  if (!done) {
    done = options;
    options = {};
  }

  if (!this.definitions) {
    return done(new Error('no definitions loaded'));
  }

  var svgElement = this.diagram.get('canvas').getContext();

  var svg = svgElement.node.innerHTML;

  svg = SVG_HEADER + svg + SVG_FOOTER;

  done(null, svg);
};

Viewer.prototype.importDefinitions = failSafeAsync(function(definitions, done) {

  if (this.diagram) {
    this.clear();
  }

  this.diagram = this.createDiagram();
  
  initListeners(this.diagram, this.__listeners || []);

  this.definitions = definitions;

  Importer.importBpmnDiagram(this.diagram, definitions, done);
});

Viewer.prototype.createDiagram = function() {
  return new Diagram({ canvas: { container: this.container }});
};

Viewer.prototype.clear = function() {
  this.container.innerHTML = '';
};

Viewer.prototype.on = function(event, handler) {
  this.__listeners = this.__listeners || [];
  this.__listeners.push({ event: event, handler: handler });
};

module.exports = Viewer;