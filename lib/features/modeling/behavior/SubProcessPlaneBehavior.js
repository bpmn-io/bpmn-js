import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isExpanded } from '../../../util/DiUtil';
import { getBusinessObject, is } from '../../../util/ModelUtil';

/**
 * Creates diPlanes and canvas planes when collapses subprocesses are created.
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {BpmnFactory} bpmnFactory
 * @param {Bpmnjs} bpmnjs
 */
export default function SubProcessPlaneBehavior(
    canvas, eventBus, modeling,
    elementFactory, bpmnFactory, bpmnjs) {

  CommandInterceptor.call(this, eventBus);

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  this._bpmnjs = bpmnjs;

  var self = this;

  function isCollapsedSubProcess(element) {
    return is(element, 'bpmn:SubProcess') && !isExpanded(element);
  }

  function createPlane(context) {
    var shape = context.shape,
        plane = context.targetPlane,
        rootElement = plane && plane.rootElement;

    var businessObject = getBusinessObject(shape);

    rootElement = self._addDiagram(rootElement || businessObject);
    context.targetPlane = canvas.createPlane(
      plane ||
      { name: businessObject.id, rootElement: rootElement });
  }

  function removePlane(context) {
    var shape = context.shape;

    var businessObject = getBusinessObject(shape);

    self._removeDiagram(businessObject);

    context.targetPlane = canvas.removePlane(businessObject.id);
  }


  // add plane elements for newly created sub-processes
  // this ensures we can actually drill down into the element
  this.executed('shape.create', function(context) {
    var shape = context.shape;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    createPlane(context);
  }, true);


  this.reverted('shape.create', 500, function(context) {
    var shape = context.shape;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    removePlane(context);
  }, true);


  this.executed('element.updateProperties', function(context) {
    var shape = context.element;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id,
        newId = properties.id;

    if (oldId === newId) {
      return;
    }

    canvas.renamePlane(oldId, newId);
  }, true);


  this.reverted('element.updateProperties', function(context) {
    var shape = context.element;
    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id,
        newId = properties.id;


    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    if (oldId === newId) {
      return;
    }

    canvas.renamePlane(newId, oldId);
  }, true);

}

inherits(SubProcessPlaneBehavior, CommandInterceptor);


/**
* Adds a given diagram to the definitions and returns a .
*
* @param {Object} planeElement
*/
SubProcessPlaneBehavior.prototype._addDiagram = function(planeElement) {
  var bpmnjs = this._bpmnjs;
  var diagrams = bpmnjs.getDefinitions().diagrams;

  if (!planeElement.businessObject) {
    planeElement = this._createDiagram(planeElement);
  }

  diagrams.push(planeElement.di.$parent);

  return planeElement;
};

/**
* Creates a new plane element for the given sub process.
*
* @param {Object} bpmnElement
*
* @return {Object} new diagram element
*/
SubProcessPlaneBehavior.prototype._createDiagram = function(bpmnElement) {
  var bpmnFactory = this._bpmnFactory;
  var elementFactory = this._elementFactory;

  var diPlane = bpmnFactory.create('bpmndi:BPMNPlane', {
    bpmnElement: bpmnElement
  });
  var diDiagram = bpmnFactory.create('bpmndi:BPMNDiagram', {
    plane: diPlane
  });
  diPlane.$parent = diDiagram;

  // add a virtual element (not being drawn),
  // a copy cat of our BpmnImporter code
  var planeElement = elementFactory.createRoot({
    id: bpmnElement.id + '_plane',
    type: bpmnElement.$type,
    di: diPlane,
    businessObject: bpmnElement,
    collapsed: true
  });

  return planeElement;
};

/**
 * Removes the diagram for a given root element
 *
 * @param {Object} rootElement
 * @returns {Object} removed bpmndi:BPMNDiagram
 */
SubProcessPlaneBehavior.prototype._removeDiagram = function(rootElement) {
  var bpmnjs = this._bpmnjs;

  var diagrams = bpmnjs.getDefinitions().diagrams;

  var removedDiagram = diagrams.find(function(diagram) {
    return diagram.plane.bpmnElement.id === rootElement.id;
  });

  diagrams.splice(diagrams.indexOf(removedDiagram), 1);

  return removedDiagram;
};


SubProcessPlaneBehavior.$inject = [
  'canvas',
  'eventBus',
  'modeling',
  'elementFactory',
  'bpmnFactory',
  'bpmnjs'
];



