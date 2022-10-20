
import { asBounds, asTRBL } from 'diagram-js/lib/layout/LayoutUtil';
import { is, isAny } from '../../util/ModelUtil';

var DEFAULT_POSITION = {
  x: 180,
  y: 160
};

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

  var newDiagrams = [];
  definitions.diagrams.forEach(function(diagram) {
    var createdDiagrams = self.createNewDiagrams(diagram.plane);
    Array.prototype.push.apply(newDiagrams, createdDiagrams);
  });

  newDiagrams.forEach(function(diagram) {
    self.movePlaneElementsToOrigin(diagram.plane);
  });
};


/**
 * Moves all DI elements from collapsed subprocesses to a new plane.
 *
 * @param {Object} plane
 * @return {Array} new diagrams created for the collapsed subprocesses
 */
SubprocessCompatibility.prototype.createNewDiagrams = function(plane) {
  var self = this;

  var collapsedElements = [];
  var elementsToMove = [];

  plane.get('planeElement').forEach(function(diElement) {
    var bo = diElement.bpmnElement;

    if (!bo) {
      return;
    }

    var parent = bo.$parent;

    if (is(bo, 'bpmn:SubProcess') && !diElement.isExpanded) {
      collapsedElements.push(bo);
    }

    if (shouldMoveToPlane(bo, plane)) {

      // don't change the array while we iterate over it
      elementsToMove.push({ diElement: diElement, parent: parent });
    }
  });

  var newDiagrams = [];

  // create new planes for all collapsed subprocesses, even when they are empty
  collapsedElements.forEach(function(element) {
    if (!self._processToDiagramMap[element.id]) {
      var diagram = self.createDiagram(element);
      self._processToDiagramMap[element.id] = diagram;
      newDiagrams.push(diagram);
    }
  });

  elementsToMove.forEach(function(element) {
    var diElement = element.diElement;
    var parent = element.parent;

    // parent is expanded, get nearest collapsed parent
    while (parent && collapsedElements.indexOf(parent) === -1) {
      parent = parent.$parent;
    }

    // false positive, all parents are expanded
    if (!parent) {
      return;
    }

    var diagram = self._processToDiagramMap[parent.id];
    self.moveToDiPlane(diElement, diagram.plane);
  });

  return newDiagrams;
};

SubprocessCompatibility.prototype.movePlaneElementsToOrigin = function(plane) {
  var elements = plane.get('planeElement');

  // get bounding box of all elements
  var planeBounds = getPlaneBounds(plane);

  var offset = {
    x: planeBounds.x - DEFAULT_POSITION.x,
    y: planeBounds.y - DEFAULT_POSITION.y
  };

  elements.forEach(function(diElement) {
    if (diElement.waypoint) {
      diElement.waypoint.forEach(function(waypoint) {
        waypoint.x = waypoint.x - offset.x;
        waypoint.y = waypoint.y - offset.y;
      });
    } else if (diElement.bounds) {
      diElement.bounds.x = diElement.bounds.x - offset.x;
      diElement.bounds.y = diElement.bounds.y - offset.y;
    }
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


// helpers //////////////////////////

function findRootDiagram(element) {
  if (is(element, 'bpmndi:BPMNDiagram')) {
    return element;
  } else {
    return findRootDiagram(element.$parent);
  }
}

function getPlaneBounds(plane) {
  var planeTrbl = {
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity,
    left: Infinity
  };

  plane.planeElement.forEach(function(element) {
    if (!element.bounds) {
      return;
    }

    var trbl = asTRBL(element.bounds);

    planeTrbl.top = Math.min(trbl.top, planeTrbl.top);
    planeTrbl.left = Math.min(trbl.left, planeTrbl.left);
  });

  return asBounds(planeTrbl);
}

function shouldMoveToPlane(bo, plane) {
  var parent = bo.$parent;

  // don't move elements that are already on the plane
  if (!is(parent, 'bpmn:SubProcess') || parent === plane.bpmnElement) {
    return false;
  }

  // dataAssociations are children of the subprocess but rendered on process level
  // cf. https://github.com/bpmn-io/bpmn-js/issues/1619
  if (isAny(bo, [ 'bpmn:DataInputAssociation', 'bpmn:DataOutputAssociation' ])) {
    return false;
  }

  return true;
}
