import {
  find
} from 'min-dash';

/**
 * Handler which deletes the currently displayed diagram.
 */
export default function DeleteDiagramHandler(bpmnjs, commandStack, diagramUtil, modeling) {
  this._bpmnjs = bpmnjs;
  this._commandStack = commandStack;
  this._diagramUtil = diagramUtil;
  this._modeling = modeling;
}

DeleteDiagramHandler.$inject = [
  'bpmnjs',
  'commandStack',
  'diagramUtil',
  'modeling'
];

DeleteDiagramHandler.prototype.canExecute = function(context) {
  return this._diagramUtil.diagrams().length > 1;
};

DeleteDiagramHandler.prototype.preExecute = function(context) {
  context.removedProcess = this._diagramUtil.currentRootElement();
  context.removedDiagram = this._diagramUtil.currentDiagram();
  var diagrams = this._diagramUtil.diagrams();

  // switch to the first diagram in the list that is not to be deleted
  var otherDiagramId = find(diagrams, function(diagram) {
    return (diagram != context.removedDiagram);
  }).id;
  this._bpmnjs.open(otherDiagramId);
};

DeleteDiagramHandler.prototype.execute = function(context) {
  context.indices = this._diagramUtil.removeDiagramById(context.removedProcess.id);
};

DeleteDiagramHandler.prototype.revert = function(context) {

  // reinsert the rootElement and diagram at the right position
  this._diagramUtil.definitions().rootElements.splice(
    context.indices.elementIndex,
    0,
    context.removedProcess
  );
  this._diagramUtil.diagrams().splice(
    context.diagramIndex,
    0,
    context.removedDiagram
  );
};
