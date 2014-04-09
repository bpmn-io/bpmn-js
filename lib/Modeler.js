var Diagram = require('diagram-js');

var bpmnModule = require('./di').defaultModule,
    Viewer = require('./Viewer');

require('./draw/BpmnRenderer');

require('diagram-js/lib/features/dnd/Visuals');
require('diagram-js/lib/features/selection/Visuals');


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

Modeler.prototype.createDiagram = function() {

  return new Diagram({
    canvas: { container: this.container },
    modules: [ bpmnModule ],
    components: [ 'selectionVisuals', 'dragVisuals' ]
  });
};

module.exports = Modeler;