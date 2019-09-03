/**
 * Handler which creates a new diagram in the same bpmn file.
 */
export default function CreateDiagramHandler(bpmnFactory, diagramUtil, commandStack) {

  this._bpmnFactory = bpmnFactory;
  this._diagramUtil = diagramUtil;
  this._commandStack = commandStack;
}

CreateDiagramHandler.$inject = [
  'bpmnFactory',
  'diagramUtil',
  'commandStack'
];

CreateDiagramHandler.prototype.createProcess = function() {
  var process = this._bpmnFactory.create('bpmn:Process', {});
  process.$parent = this._diagramUtil.definitions();
  return process;
};

CreateDiagramHandler.prototype.createDiagram = function(rootElement) {
  var plane = this._bpmnFactory.createDiPlane(rootElement);
  var diagram = this._bpmnFactory.create('bpmndi:BPMNDiagram', {
    plane: plane
  });
  plane.$parent = diagram;
  diagram.$parent = this._diagramUtil.definitions();
  return diagram;
};

CreateDiagramHandler.prototype.preExecute = function(context) {

  // create new semantic objects
  var newProcess = this.createProcess();
  var newDiagram = this.createDiagram(newProcess);

  // store them in the context
  context.newProcess = newProcess;
  context.newDiagram = newDiagram;
};

CreateDiagramHandler.prototype.execute = function(context) {
  this._diagramUtil.definitions().rootElements.push(context.newProcess);
  this._diagramUtil.diagrams().push(context.newDiagram);
};

CreateDiagramHandler.prototype.postExecute = function(context) {
  this._commandStack.execute('diagram.switch', {
    id: context.newDiagram.id
  });
};

CreateDiagramHandler.prototype.revert = function(context) {
  this._diagramUtil.removeDiagramById(context.newProcess.id);
};
