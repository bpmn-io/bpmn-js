
import { selfAndAllChildren } from 'diagram-js/lib/util/Elements';
import { isExpanded } from '../../util/DiUtil';
import { getBusinessObject, getDi, is } from '../../util/ModelUtil';

export default function SubprocessCompatibility(eventBus, elementRegistry, canvas, moddle, elementFactory, bpmnjs) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;
  this._bpmnjs = bpmnjs;
  this._moddle = moddle;
  this._elementFactory = elementFactory;

  var self = this;

  eventBus.on('import.done', 1500, function() {
    self._handleImport();
  });
}

SubprocessCompatibility.prototype._handleImport = function() {
  var elementRegistry = this._elementRegistry;
  var canvas = this._canvas;
  var elementFactory = this._elementFactory;
  var self = this;
  var legacyProcesses = elementRegistry.filter(function(element) {
    return is(element, 'bpmn:SubProcess') && !isExpanded(element) && element.children && element.children.length;
  });

  legacyProcesses.forEach(function(oldParent) {
    var bo = getBusinessObject(oldParent);

    var newDiagram = self.createDiagram(bo);

    var newParent = elementFactory.createRoot(
      {
        id: bo.id,
        type: bo.$type,
        businessObject: bo,
        di: newDiagram.plane
      }
    );

    newParent.id = newParent.id + '_plane';

    canvas.createPlane(bo.id, newParent);

    var elementsToChange = selfAndAllChildren(oldParent).filter(function(el) {
      return el !== oldParent;
    });

    self.moveElementsToRoot(elementsToChange);

    elementsToChange.forEach(function(el) {
      if (el.parent === oldParent) {
        el.parent = newParent;
      }
      el.hidden = el.parent && (el.parent.hidden || el.parent.collapsed);

      self.moveToDiPlane(el, newDiagram.plane);

      self._eventBus.fire('elements.changed', { elements: [el] });
    });
  });

};

SubprocessCompatibility.prototype.moveToDiPlane = function(element, newPlane) {
  var di = getDi(element);
  var containingDiagram = findRootDiagram(di);

  // Remove DI from old Plane and add it to the new one
  var parentPlaneElement = containingDiagram.plane.get('planeElement');
  parentPlaneElement.splice(parentPlaneElement.indexOf(di), 1);
  newPlane.get('planeElement').push(di);
};

SubprocessCompatibility.prototype.moveElementsToRoot = function(elements) {
  var defaultPosition = { x: 180, y: 160 },
      minX = Infinity,
      minY = Infinity;

  elements.forEach(function(el) {
    minX = Math.min(minX, el.x || Infinity);
    minY = Math.min(minY, el.y || Infinity);
  });

  var xOffset = defaultPosition.x - minX;
  var yOffset = defaultPosition.y - minY;

  elements.forEach(function(el) {
    if (el.waypoints) {
      el.waypoints.forEach(function(waypoint) {
        waypoint.x = waypoint.x + xOffset;
        waypoint.y = waypoint.y + yOffset;
      });
    } else {
      el.x = el.x + xOffset;
      el.y = el.y + yOffset;
    }
  });
};

SubprocessCompatibility.prototype.getDefinitions = function() {
  return this._bpmnjs._definitions || [];
};

SubprocessCompatibility.prototype.getDiagrams = function() {
  return this.getDefinitions().diagrams || [];
};

SubprocessCompatibility.prototype.createDiagram = function(bo) {
  var plane = this._moddle.create('bpmndi:BPMNPlane', { bpmnElement: bo });
  var diagram = this._moddle.create('bpmndi:BPMNDiagram', {
    plane: plane
  });
  plane.$parent = diagram;
  plane.bpmnElement = bo;
  diagram.$parent = this.getDefinitions();
  this.getDiagrams().push(diagram);
  return diagram;
};

SubprocessCompatibility.$inject = [ 'eventBus', 'elementRegistry', 'canvas', 'moddle', 'elementFactory', 'bpmnjs' ];


//  Util

var findRootDiagram = function(element) {
  if (is(element, 'bpmndi:BPMNDiagram')) {
    return element;
  } else {
    return findRootDiagram(element.$parent);
  }
};