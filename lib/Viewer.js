var Diagram = require('diagram-js'),
    BpmnModel = require('bpmn-moddle'),
    fs = require('fs'),
    $ = require('jquery'),
    _ = require('lodash');

var Importer = require('./import/Importer'),
    failSafeAsync = require('./Util').failSafeAsync;

var bpmnModule = require('./di').defaultModule;

require('./draw/BpmnRenderer');

require('./feature/zoomscroll');
require('./feature/movecanvas');

require('diagram-js/lib/features/selection/Visuals');


function getSvgNode(diagram) {
  var paper = diagram.get('canvas').getPaper();
  return paper.node;
}

function initListeners(diagram, listeners) {
  var events = diagram.get('eventBus');

  listeners.forEach(function(l) {
    events.on(l.event, l.handler);
  });
}

/**
 * @class
 *
 * A viewer for BPMN 2.0 diagrams
 * 
 * @param {Object} [options] configuration options to pass to the viewer
 * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
 * @param {String|Number} [options.width] the width of the viewer
 * @param {String|Number} [options.height] the height of the viewer
 */
function Viewer(options) {
  options = options || {};

  var parent = options.container || $('body');

  var container = $('<div></div>').addClass('bjs-container').css({
    position: 'relative'
  }).appendTo(parent);

  _.forEach([ 'width', 'height' ], function(a) {
    if (options[a]) {
      container.css(a, options[a]);
    }
  });

  // unwrap jquery
  this.container = container.get(0);

  var logoData = fs.readFileSync('resources/bpmnjs.png', 'base64');

  var a = $('<a href="http://bpmn.io" target="_blank" class="bjs-powered-by" title="Powered by bpmn.io" />').css({
    position: 'absolute',
    bottom: 15,
    right: 15,
    zIndex: 100
  });

  var logo = $('<img/>').attr('src', 'data:image/png;base64,' + logoData).appendTo(a);

  a.appendTo(container);
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

  var svgNode = getSvgNode(this.diagram);
  var svg = svgNode.innerHTML;

  svg = SVG_HEADER + svg + SVG_FOOTER;

  done(null, svg);
};

Viewer.prototype.get = function(name) {

  if (!this.diagram) {
    return null;
  }

  return this.diagram.get(name);
};

Viewer.prototype.importDefinitions = failSafeAsync(function(definitions, done) {

  if (this.diagram) {
    this.clear();
  }

  var diagram = this.createDiagram();
  
  this.initDiagram(diagram);

  this.definitions = definitions;

  Importer.importBpmnDiagram(diagram, definitions, done);
});

Viewer.prototype.initDiagram = function(diagram) {
  this.diagram = diagram;

  initListeners(diagram, this.__listeners || []);
};

Viewer.prototype.createDiagram = function() {

  return new Diagram({
    canvas: { container: this.container },
    modules: [ bpmnModule ],
    components: [ 'selectionVisuals', 'zoomScroll', 'moveCanvas' ]
  });
};

Viewer.prototype.clear = function() {
  var diagram = this.diagram;

  if (diagram) {
    diagram.destroy();
  }
};

Viewer.prototype.on = function(event, handler) {
  this.__listeners = this.__listeners || [];
  this.__listeners.push({ event: event, handler: handler });
};

module.exports = Viewer;