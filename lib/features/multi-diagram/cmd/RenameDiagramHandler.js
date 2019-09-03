/**
 * Handler which renames the currently displayed diagram.
 */
export default function RenameDiagramHandler(diagramUtil) {

  this._diagramUtil = diagramUtil;
}

RenameDiagramHandler.$inject = [
  'diagramUtil'
];

RenameDiagramHandler.prototype.preExecute = function(context) {
  context.oldName = this._diagramUtil.currentDiagram().id;
};

RenameDiagramHandler.prototype.execute = function(context) {
  this._diagramUtil.currentDiagram().id = context.newName;
};

RenameDiagramHandler.prototype.revert = function(context) {
  this._diagramUtil.currentDiagram().id = context.oldName;
};
