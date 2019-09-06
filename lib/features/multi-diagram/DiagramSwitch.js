import CreateDiagramHandler from './cmd/CreateDiagramHandler';
import DeleteDiagramHandler from './cmd/DeleteDiagramHandler';
import RenameDiagramHandler from './cmd/RenameDiagramHandler';
import SwitchDiagramHandler from './cmd/SwitchDiagramHandler';

export default function DiagramSwitch(eventBus, commandStack, diagramUtil) {
  this._eventBus = eventBus;
  this._commandStack = commandStack;
  this._diagramUtil = diagramUtil;

  // Bind this globally
  this.registerHandlers = registerHandlers.bind(this);

  // Register to events
  this._eventBus.on('diagram.init', this.registerHandlers);
}

function registerHandlers() {

  this._commandStack.registerHandler('diagram.create', CreateDiagramHandler);
  this._commandStack.registerHandler('diagram.delete', DeleteDiagramHandler);
  this._commandStack.registerHandler('diagram.rename', RenameDiagramHandler);
  this._commandStack.registerHandler('diagram.switch', SwitchDiagramHandler);
}

DiagramSwitch.$inject = [
  'eventBus',
  'commandStack',
  'diagramUtil'
];

DiagramSwitch.prototype.addDiagram = function() {
  this._commandStack.execute('diagram.create', {});
};

DiagramSwitch.prototype.deleteDiagram = function() {
  if (this._commandStack.canExecute('diagram.delete', {})) {
    this._commandStack.execute('diagram.delete', {});
  }
};

DiagramSwitch.prototype.renameDiagram = function(name) {
  if (this._commandStack.canExecute('diagram.rename', { newName: name })) {
    this._commandStack.execute('diagram.rename', {
      newName: name
    });
  }
};

DiagramSwitch.prototype.switchDiagram = function(diagramId) {
  this._commandStack.execute('diagram.switch', {
    id: diagramId
  });
};
