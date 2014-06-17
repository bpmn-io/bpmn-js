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

// modules that comprise the bpmn modeler
Modeler.prototype._modules = Modeler.prototype._modules.concat([
  // TODO (nre): buggy in conjunction with zoomscroll / move canvas
  // require('diagram-js/lib/features/move'),
  require('./features/label-editing'),
  require('./features/zoomscroll'),
  require('./features/movecanvas')
]);

module.exports = Modeler;
