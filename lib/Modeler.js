var Diagram = require('diagram-js');

var bpmnModule = require('./di').defaultModule,
    Viewer = require('./Viewer');

require('./core/BpmnRegistry');

require('./draw/BpmnRenderer');

require('diagram-js/lib/features/dnd/Visuals');
require('diagram-js/lib/features/selection/Visuals');


function Modeler(container) {
  Viewer.call(this, container);
}

Modeler.prototype = new Viewer();

Modeler.prototype.createDiagram = function() {

  return new Diagram({
    canvas: { container: this.container },
    modules: [ bpmnModule ],
    components: [ 'selectionVisuals', 'dragVisuals', 'bpmnRegistry']
  });
};

module.exports = Modeler;