'use strict';

var inherits = require('inherits');

var IdSupport = require('bpmn-moddle/lib/id-support'),
    Ids = require('ids');

var Viewer = require('./Viewer');

var initialDiagram =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false">' +
      '<bpmn:startEvent id="StartEvent_1"/>' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
      '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
        '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
          '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
        '</bpmndi:BPMNShape>' +
      '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';

/**
 * A modeler for BPMN 2.0 diagrams.
 *
 * @class
 *
 * @inheritDoc djs.Viewer
 */
function Modeler(options) {
  Viewer.call(this, options);
}

inherits(Modeler, Viewer);

Modeler.prototype.createDiagram = function(done) {
  return this.importXML(initialDiagram, done);
};

Modeler.prototype.createModdle = function() {
  var moddle = Viewer.prototype.createModdle.call(this);

  IdSupport.extend(moddle, new Ids([ 32, 36, 1 ]));

  return moddle;
};


Modeler.prototype._interactionModules = [
  // non-modeling components
  require('./features/label-editing'),
  require('diagram-js/lib/navigation/zoomscroll'),
  require('diagram-js/lib/navigation/movecanvas'),
  require('diagram-js/lib/navigation/touch')
];

Modeler.prototype._modelingModules = [
  // modeling components
  require('diagram-js/lib/features/keyboard'),
  require('diagram-js/lib/features/move'),
  require('diagram-js/lib/features/bendpoints'),
  require('diagram-js/lib/features/resize'),
  require('diagram-js/lib/features/space-tool'),
  require('diagram-js/lib/features/lasso-tool'),
  require('./features/snapping'),
  require('./features/modeling'),
  require('./features/context-pad'),
  require('./features/palette')
];


// modules the modeler is composed of
//
// - viewer modules
// - interaction modules
// - modeling modules

Modeler.prototype._modules = [].concat(
  Modeler.prototype._modules,
  Modeler.prototype._interactionModules,
  Modeler.prototype._modelingModules);


module.exports = Modeler;
