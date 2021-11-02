
import { is } from '../../util/ModelUtil';

/**
 * Hook into `import.render.start` and create new planes for diagrams with
 * collapsed subprocesses and all dis on the same plane.
 *
 * @param {eventBus} eventBus
 * @param {moddle} moddle
 */
export default function SubprocessCompatibility(eventBus, moddle) {
  this._eventBus = eventBus;
  this._moddle = moddle;

  var self = this;

  eventBus.on('import.render.start', 1500, function(e, context) {
    self.handleImport(context.definitions);
  });
}

SubprocessCompatibility.prototype.handleImport = function(definitions) {
  if (!definitions.diagrams) {
    return;
  }

  var self = this;
  this._definitions = definitions;
  this._processToDiagramMap = {};

  definitions.diagrams.forEach(function(diagram) {
    if (!diagram.plane || !diagram.plane.bpmnElement) {
      return;
    }

    self._processToDiagramMap[diagram.plane.bpmnElement.id] = diagram;
  });

  definitions.diagrams.forEach(function(diagram) {
    self.fixPlaneDi(diagram.plane);
  });

};


SubprocessCompatibility.prototype.fixPlaneDi = function(plane) {
  var self = this;

  var collapsedElements = [];
  var elementsToMove = [];

  plane.get('planeElement').forEach(function(diElement) {
    var bo = diElement.bpmnElement;
    var parent = bo.$parent;

    if (is(bo, 'bpmn:SubProcess') && !diElement.isExpanded) {
      collapsedElements.push(bo);
    }

    if (is(parent, 'bpmn:SubProcess') && parent !== plane.bpmnElement) {

      // don't change the array while we iterate over it
      elementsToMove.push({ diElement: diElement, parent: parent });
    }
  });

  elementsToMove.forEach(function(element) {
    var diElement = element.diElement;
    var parent = element.parent;

    // parent is expanded, get nearest collapsed parent
    while (parent && !collapsedElements.includes(parent)) {
      parent = parent.$parent;
    }

    // false positive, all parents are expanded
    if (!parent) {
      return;
    }

    var diagram = self._processToDiagramMap[parent.id];
    if (!diagram) {
      diagram = self.createDiagram(parent);
      self._processToDiagramMap[parent.id] = diagram;
    }

    self.moveToDiPlane(diElement, diagram.plane);
  });
};


SubprocessCompatibility.prototype.moveToDiPlane = function(diElement, newPlane) {
  var containingDiagram = findRootDiagram(diElement);

  // remove DI from old Plane and add it to the new one
  var parentPlaneElement = containingDiagram.plane.get('planeElement');
  parentPlaneElement.splice(parentPlaneElement.indexOf(diElement), 1);
  newPlane.get('planeElement').push(diElement);
};


SubprocessCompatibility.prototype.createDiagram = function(bo) {
  var plane = this._moddle.create('bpmndi:BPMNPlane', { bpmnElement: bo });
  var diagram = this._moddle.create('bpmndi:BPMNDiagram', {
    plane: plane
  });
  plane.$parent = diagram;
  plane.bpmnElement = bo;
  diagram.$parent = this._definitions;
  this._definitions.diagrams.push(diagram);
  return diagram;
};

SubprocessCompatibility.$inject = [ 'eventBus', 'moddle' ];


// helpers

function findRootDiagram(element) {
  if (is(element, 'bpmndi:BPMNDiagram')) {
    return element;
  } else {
    return findRootDiagram(element.$parent);
  }
}