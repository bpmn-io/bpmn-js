import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  find
} from 'min-dash';

import { getBusinessObject, getDi, is } from '../../util/ModelUtil';
import { selfAndAllChildren } from '../../../../diagram-js/lib/util/Elements';

var HIGH_PRIORITY = 5000;


export default function ExpandBehaviour(commandStack, injector, canvas, bpmnImporter, bpmnUpdater, bpmnjs, elementRegistry, eventBus, modeling, bpmnFactory) {

  injector.invoke(CommandInterceptor, this);

  var handler = function(event) {
    const shape = event.context.shape;
    const diagrams = bpmnjs.getDefinitions().diagrams;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (!shape.collapsed) {

      // expand
      var oldDiagram = findDiagram(shape.id);
      var newDiagram = findRootDiagram(getDi(shape));

      // Add elements to parent diagram
      oldDiagram.plane.planeElement.forEach(di => {
        var childElement = elementRegistry.get(di.bpmnElement.id);
        var bo = childElement.businessObject;
        var parent = elementRegistry.get(bo.$parent.id);

        if (parent === shape) {
          childElement.parent = shape;
          eventBus.fire('elements.changed', { elements: [childElement] });
        }

        // reorder di
        newDiagram.plane.planeElement.push(di);
      });

      diagrams.splice(diagrams.indexOf(oldDiagram), 1);

      // debugger;
      canvas.setRootElementForPlane(null, shape.id, true);
      elementRegistry.remove(shape.id + '_layer');
    } else {

      // Collapse
      var bo = getBusinessObject(shape);
      newDiagram = createDiagram(shape);
      diagrams.push(newDiagram);
      console.log(shape, bo, newDiagram.plane);
      var newShape = bpmnImporter.add(bo, newDiagram.plane);
      var planeElements = newDiagram.plane.get('planeElement');

      oldDiagram = findRootDiagram(getDi(shape));

      selfAndAllChildren(shape).forEach(function(childShape) {
        if (childShape === shape) {
          return;
        }

        if (childShape.parent === shape) {
          childShape.parent = newShape;
        }
        childShape.hidden = false;

        var di = getDi(childShape);

        // Remove DI from old Plane and add it to the new one
        var parentPlaneElements = oldDiagram.plane.get('planeElement');
        parentPlaneElements.splice(parentPlaneElements.indexOf(di), 1);
        planeElements.push(di);

        eventBus.fire('elements.changed', { elements: [childShape] });

      });

      bo.flowElements.forEach(el => {
      });
    }
  };

  this.executed([ 'shape.toggleCollapse' ], HIGH_PRIORITY, handler);


  this.reverted([ 'shape.toggleCollapse' ], HIGH_PRIORITY, handler);

  // Util

  var findRootDiagram = function(element) {
    if (is(element, 'bpmndi:BPMNDiagram')) {
      return element;
    } else {
      return findRootDiagram(element.$parent);
    }
  };

  var findDiagram = function(id) {
    return find(bpmnjs.getDefinitions().diagrams, function(diagram) {
      const plane = diagram.plane,
            bpmnElement = plane.bpmnElement;

      console.log(diagram, bpmnElement, id);
      return bpmnElement.id === id;
    });
  };

  var createDiagram = function(shape) {
    var bo = getBusinessObject(shape);
    var plane = bpmnFactory.createDiPlane(bo);
    var diagram = bpmnFactory.create('bpmndi:BPMNDiagram', {
      plane: plane
    });

    // shape.di = plane;
    plane.$parent = diagram;
    plane.bpmnElement = bo;
    diagram.$parent = bpmnjs.getDefinitions();
    return diagram;
  };
}

inherits(ExpandBehaviour, CommandInterceptor);

ExpandBehaviour.$inject = [ 'commandStack', 'injector', 'canvas', 'bpmnImporter', 'bpmnUpdater', 'bpmnjs', 'elementRegistry', 'eventBus', 'modeling', 'bpmnFactory' ];
