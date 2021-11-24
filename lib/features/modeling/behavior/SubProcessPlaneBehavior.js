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

  // add plane elements for newly created sub-processes
  // this ensures we can actually drill down into the element
  this.executed('shape.create', function(context) {
    var shape = context.shape;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    var businessObject = getBusinessObject(shape);

    self._createNewDiagram(businessObject);

  }, true);


  this.reverted('shape.create', 500, function(context) {
    var shape = context.shape;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    var businessObject = getBusinessObject(shape);

    self._removeDiagram(businessObject);

  }, true);


  this.executed('element.updateProperties', function(context) {
    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id,
        newId = properties.id;

    self._renamePlane(oldId, newId);
  }, true);


  this.reverted('element.updateProperties', function(context) {
    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id,
        newId = properties.id;

    self._renamePlane(newId, oldId);

  }, true);

}

inherits(SubProcessPlaneBehavior, CommandInterceptor);


/**
* Creates a new plane element for the given sub process and
* adds it to the canvas.
*
* @param {Object} rootElement
*/
SubProcessPlaneBehavior.prototype._createNewDiagram = function(rootElement) {
  var canvas = this._canvas;
  var bpmnFactory = this._bpmnFactory;
  var elementFactory = this._elementFactory;
  var bpmnjs = this._bpmnjs;

  var diagrams = bpmnjs.getDefinitions().diagrams;

  var diPlane = bpmnFactory.create('bpmndi:BPMNPlane', {
    bpmnElement: rootElement
  });
  var diDiagram = bpmnFactory.create('bpmndi:BPMNDiagram', {
    plane: diPlane
  });
  diPlane.$parent = diDiagram;
  diagrams.push(diDiagram);

  // add a virtual element (not being drawn),
  // a copy cat of our BpmnImporter code
  var planeElement = elementFactory.createRoot({
    id: rootElement.id + '_plane',
    type: rootElement.$type,
    di: diPlane,
    businessObject: rootElement,
    collapsed: true
  });

  canvas.createPlane(rootElement.id, planeElement);

  return planeElement;
};

/**
 * Removes the diagram for a given root element
 *
 * @param {Object} rootElement
 * @returns {Object} removed bpmndi:BPMNDiagram
 */
SubProcessPlaneBehavior.prototype._removeDiagram = function(rootElement) {
  var canvas = this._canvas;
  var bpmnjs = this._bpmnjs;

  var diagrams = bpmnjs.getDefinitions().diagrams;

  var removedDiagram = diagrams.find(function(diagram) {
    return diagram.plane.bpmnElement.id === rootElement.id;
  });

  diagrams.splice(diagrams.indexOf(removedDiagram), 1);

  canvas.removePlane(rootElement.id);

  return removedDiagram;
};

/**
 * Renames a canvas plane.
 *
 * @param {String} oldId
 * @param {String} newId
 */
SubProcessPlaneBehavior.prototype._renamePlane = function(oldId, newId) {
  var canvas = this._canvas;

  if (!oldId || !canvas.getPlane(oldId)) {
    return;
  }

  var oldPlane = canvas.getPlane(oldId),
      oldRoot = oldPlane.rootElement;

  canvas.removePlane(oldPlane);
  canvas.createPlane(newId, oldRoot);
};

SubProcessPlaneBehavior.$inject = [
  'canvas',
  'eventBus',
  'modeling',
  'elementFactory',
  'bpmnFactory',
  'bpmnjs'
];



