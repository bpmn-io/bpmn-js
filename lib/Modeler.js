'use strict';

var Diagram = require('diagram-js');

var Viewer = require('./Viewer');


/**
 * @class
 *
 * A modeler for BPMN 2.0 diagrams.
 *
 * @borrows Viewer as Modeler
 */
function Modeler(options) {
  Viewer.call(this, options);
}

Modeler.prototype = Object.create(Viewer.prototype);

Modeler.prototype.createDiagram = function(modules) {
  return Viewer.prototype.createDiagram.call(this, modules || Modeler.modules);
};

Modeler.modules = [
  // TODO (nre): buggy in conjunction with zoomscroll / move canvas
  // require('diagram-js/lib/features/move'),
  require('./features/label-editing'),
  require('./core'),
  require('./features/zoomscroll'),
  require('./features/movecanvas')
];

module.exports = Modeler;
