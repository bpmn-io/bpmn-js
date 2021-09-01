import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../util/ModelUtil';


export default function RemoveDiagramBehavior(canvas, bpmnjs, injector, elementRegistry, commandStack) {

  var removeNestedProcesses = function(process) {
    var removedProcesses = [];

    process.flowElements && process.flowElements.forEach(element => {
      if (is(element, 'bpmn:SubProcess')) {
        removedProcesses = removedProcesses.concat(removeNestedProcesses(element));
      }
    });

    var removedDi = removeProcess(process.id);

    if (removedDi) {
      removedProcesses.push(removedDi);
    }
    return removedProcesses;
  };

  injector.invoke(CommandInterceptor, this);

  this.executed('shape.delete', function(event) {
    var context = event.context;

    if (is(context.shape, 'bpmn:SubProcess')) {
      var removedDi = removeNestedProcesses(context.shape.businessObject);
      context.removedDiDiagrams = removedDi;
    }
  });

  this.reverted('shape.delete', function(event) {
    var context = event.context;

    if (is(context.shape, 'bpmn:SubProcess') && context.removedDiDiagrams) {
      var diagrams = bpmnjs.getDefinitions().diagrams;
      Array.prototype.push.apply(diagrams, context.removedDiDiagrams);
    }
  });

  // Util
  var removeProcess = function(id) {
    var diagrams = bpmnjs.getDefinitions().diagrams,
        removedDiagram;
    var diagramIndex = diagrams.findIndex(element => {
      return element.plane.bpmnElement.id === id;
    });

    if (diagramIndex > -1) {
      removedDiagram = diagrams[diagramIndex];
      diagrams.splice(diagramIndex, 1);
    }
    return removedDiagram;
  };
}

inherits(RemoveDiagramBehavior, CommandInterceptor);

RemoveDiagramBehavior.$inject = [ 'canvas', 'bpmnjs', 'injector', 'elementRegistry', 'commandStack' ];
