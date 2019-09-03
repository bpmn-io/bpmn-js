/**
 * Handler which switches between diagrams on the currently open bpmn file
 */
export default function SwitchDiagramHandler(bpmnjs, diagramUtil) {

  this._bpmnjs = bpmnjs;
  this._diagramUtil = diagramUtil;
}

SwitchDiagramHandler.$inject = [
  'bpmnjs',
  'diagramUtil'
];

SwitchDiagramHandler.prototype.preExecute = function(context) {
  context.previousId = this._diagramUtil.currentDiagram().id;
};

SwitchDiagramHandler.prototype.execute = function(context) {
  this._bpmnjs.open(context.id);
};

SwitchDiagramHandler.prototype.revert = function(context) {
  this._bpmnjs.open(context.previousId);
};
