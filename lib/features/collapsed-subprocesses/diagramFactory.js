import {
  find
} from 'min-dash';


export default function DiagramRegistry(bpmnjs, bpmnFactory) {
  this._bpmnjs = bpmnjs;
  this._bpmnFactory = bpmnFactory;
}

DiagramRegistry.prototype.getDefinitions = function() {
  return this._bpmnjs._definitions || [];
};

DiagramRegistry.prototype.getDiagrams = function() {
  return this.getDefinitions().diagrams || [];
};

DiagramRegistry.prototype.findDiagram = function(id) {
  return find(this._bpmnjs.getDefinitions().diagrams, function(diagram) {
    const plane = diagram.plane,
          bpmnElement = plane.bpmnElement;

    return bpmnElement.id === id;
  });
};

DiagramRegistry.prototype.createProcess = function() {
  var process = this._bpmnFactory.create('bpmn:Process', {});
  process.$parent = this.getDefinitions();
  return process;
};

DiagramRegistry.prototype.createDiagram = function(rootElement) {
  var plane = this._bpmnFactory.createDiPlane(rootElement);
  var diagram = this._bpmnFactory.create('bpmndi:BPMNDiagram', {
    plane: plane
  });
  rootElement.di = plane;
  plane.$parent = diagram;
  plane.bpmnElement = rootElement;
  diagram.$parent = this.getDefinitions();
  return diagram;
};

DiagramRegistry.prototype.removeProcess = function(id) {
  let diagramIndex = this.getDiagrams().findIndex(element => {
    return element.plane.bpmnElement.id === id;
  });
  if (diagramIndex > -1) {
    this.getDiagrams().splice(diagramIndex, 1);
  }
};


DiagramRegistry.$inject = ['bpmnjs', 'bpmnFactory'];