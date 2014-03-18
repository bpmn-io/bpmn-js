var Diagram = require('diagram-js');
var Renderer = require('./Renderer');

require('diagram-js/src/features/DragUI');
require('diagram-js/src/features/SelectionUI');

function Modeler(container) {
  Renderer.call(this, container);
}

Modeler.prototype = new Renderer();

Modeler.prototype.createDiagram = function() {
  return new Diagram({ canvas: { container: this.container }, plugins: [ 'selectionUI', 'dragUI' ]});
};

module.exports = Modeler;