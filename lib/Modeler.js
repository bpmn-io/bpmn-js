var Diagram = require('diagram-js');

var bpmnModule = require('./di').defaultModule,
    Viewer = require('./Viewer');

require('./draw/BpmnRenderer');

require('diagram-js/src/features/DragUI');
require('diagram-js/src/features/SelectionUI');


function Modeler(container) {
  Viewer.call(this, container);
}

Modeler.prototype = new Viewer();

Modeler.prototype.createDiagram = function() {

  return new Diagram({
    canvas: { container: this.container },
    modules: [ bpmnModule ],
    components: [ 'selectionUI', 'dragUI' ]
  });
};

module.exports = Modeler;