import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { find } from 'min-dash';

import { isExpanded } from '../../../util/DiUtil';

import { getBusinessObject, getDi, is } from '../../../util/ModelUtil';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

import { getBBox } from 'diagram-js/lib/util/Elements';

import {
  getPlaneIdFromShape,
  getShapeIdFromPlane,
  isPlane,
  toPlaneId
} from '../../../util/DrilldownUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('../ElementFactory').default} ElementFactory
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 * @typedef {import('../../../Modeler').default} Modeler
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Root} Root
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 */

var LOW_PRIORITY = 400;
var HIGH_PRIORITY = 600;

var DEFAULT_POSITION = {
  x: 180,
  y: 160
};


/**
 * Creates bpmndi:BPMNPlane elements and canvas planes when collapsed subprocesses are created.
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {BpmnFactory} bpmnFactory
 * @param {Modeler} bpmnjs
 * @param {ElementRegistry} elementRegistry
 */
export default function SubProcessPlaneBehavior(
    canvas, eventBus, modeling,
    elementFactory, bpmnFactory, bpmnjs, elementRegistry) {

  CommandInterceptor.call(this, eventBus);

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  this._bpmnjs = bpmnjs;
  this._elementRegistry = elementRegistry;

  var self = this;

  function isCollapsedSubProcess(element) {
    return is(element, 'bpmn:SubProcess') && !isExpanded(element);
  }

  function createRoot(context) {
    var shape = context.shape,
        rootElement = context.newRootElement;

    var businessObject = getBusinessObject(shape);

    rootElement = self._addDiagram(rootElement || businessObject);

    context.newRootElement = canvas.addRootElement(rootElement);
  }

  function removeRoot(context) {
    var shape = context.shape;

    var businessObject = getBusinessObject(shape);
    self._removeDiagram(businessObject);

    var rootElement = context.newRootElement = elementRegistry.get(getPlaneIdFromShape(businessObject));

    canvas.removeRootElement(rootElement);
  }

  // add plane elements for newly created sub-processes
  // this ensures we can actually drill down into the element
  this.executed('shape.create', function(context) {
    var shape = context.shape;
    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    createRoot(context);
  }, true);


  this.postExecuted('shape.create', function(context) {
    var shape = context.shape,
        rootElement = context.newRootElement;

    if (!rootElement || !shape.children) {
      return;
    }

    self._showRecursively(shape.children);

    self._moveChildrenToShape(shape, rootElement);
  }, true);


  this.reverted('shape.create', function(context) {
    var shape = context.shape;
    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    removeRoot(context);
  }, true);


  this.preExecuted('shape.delete', function(context) {
    var shape = context.shape;
    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    var attachedRoot = elementRegistry.get(getPlaneIdFromShape(shape));

    if (!attachedRoot) {
      return;
    }

    modeling.removeElements(attachedRoot.children.slice());
  }, true);


  this.executed('shape.delete', function(context) {
    var shape = context.shape;
    if (!isCollapsedSubProcess(shape)) {
      return;
    }
    removeRoot(context);
  }, true);


  this.reverted('shape.delete', function(context) {
    var shape = context.shape;
    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    createRoot(context);
  }, true);


  this.preExecuted('shape.replace', function(context) {
    var oldShape = context.oldShape;
    var newShape = context.newShape;

    if (!isCollapsedSubProcess(oldShape) || !isCollapsedSubProcess(newShape)) {
      return;
    }

    // old plane could have content,
    // we remove it so it is not recursively deleted from 'shape.delete'
    context.oldRoot = canvas.removeRootElement(getPlaneIdFromShape(oldShape));
  }, true);


  this.postExecuted('shape.replace', function(context) {
    var newShape = context.newShape,
        source = context.oldRoot,
        target = canvas.findRoot(getPlaneIdFromShape(newShape));

    if (!source || !target) {
      return;
    }
    var elements = source.children;

    modeling.moveElements(elements, { x: 0, y: 0 }, target);
  }, true);


  // rename primary elements when the secondary element changes
  // this ensures rootElement.id = element.id + '_plane'
  this.executed('element.updateProperties', function(context) {
    var shape = context.element;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id,
        newId = properties.id;

    if (oldId === newId) {
      return;
    }

    if (isPlane(shape)) {
      elementRegistry.updateId(shape, toPlaneId(newId));
      elementRegistry.updateId(oldId, newId);

      return;
    }

    var planeElement = elementRegistry.get(toPlaneId(oldId));

    if (!planeElement) {
      return;
    }

    elementRegistry.updateId(toPlaneId(oldId), toPlaneId(newId));
  }, true);


  this.reverted('element.updateProperties', function(context) {
    var shape = context.element;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id,
        newId = properties.id;

    if (oldId === newId) {
      return;
    }

    if (isPlane(shape)) {
      elementRegistry.updateId(shape, toPlaneId(oldId));
      elementRegistry.updateId(newId, oldId);

      return;
    }

    var planeElement = elementRegistry.get(toPlaneId(newId));

    if (!planeElement) {
      return;
    }

    elementRegistry.updateId(planeElement, toPlaneId(oldId));
  }, true);

  // re-throw element.changed to re-render primary shape if associated plane has
  // changed (e.g. bpmn:name property has changed)
  eventBus.on('element.changed', function(context) {
    var element = context.element;

    if (!isPlane(element)) {
      return;
    }

    var plane = element;

    var primaryShape = elementRegistry.get(getShapeIdFromPlane(plane));

    // do not re-throw if no associated primary shape (e.g. bpmn:Process)
    if (!primaryShape || primaryShape === plane) {
      return;
    }

    eventBus.fire('element.changed', { element: primaryShape });
  });


  // create/remove plane for the subprocess
  this.executed('shape.toggleCollapse', LOW_PRIORITY, function(context) {
    var shape = context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (!isExpanded(shape)) {
      createRoot(context);
      self._showRecursively(shape.children);
    } else {
      removeRoot(context);
    }

  }, true);


  // create/remove plane for the subprocess
  this.reverted('shape.toggleCollapse', LOW_PRIORITY, function(context) {
    var shape = context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (!isExpanded(shape)) {
      createRoot(context);
      self._showRecursively(shape.children);
    } else {
      removeRoot(context);
    }

  }, true);

  // move elements between planes
  this.postExecuted('shape.toggleCollapse', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    var rootElement = context.newRootElement;

    if (!rootElement) {
      return;
    }

    if (!isExpanded(shape)) {

      // collapsed
      self._moveChildrenToShape(shape, rootElement);

    } else {
      self._moveChildrenToShape(rootElement, shape);
    }
  }, true);


  // copy-paste ///////////

  // add elements in plane to tree
  eventBus.on('copyPaste.createTree', function(context) {
    var element = context.element,
        children = context.children;

    if (!isCollapsedSubProcess(element)) {
      return;
    }

    var id = getPlaneIdFromShape(element);
    var parent = elementRegistry.get(id);

    if (parent) {

      // do not copy invisible root element
      children.push.apply(children, parent.children);
    }
  });

  // set plane children as direct children of collapsed shape
  eventBus.on('copyPaste.copyElement', function(context) {
    var descriptor = context.descriptor,
        element = context.element,
        elements = context.elements;

    var parent = element.parent;

    var isPlane = is(getDi(parent), 'bpmndi:BPMNPlane');
    if (!isPlane) {
      return;
    }

    var parentId = getShapeIdFromPlane(parent);

    var referencedShape = find(elements, function(element) {
      return element.id === parentId;
    });

    if (!referencedShape) {
      return;
    }

    descriptor.parent = referencedShape.id;
  });

  // hide children during pasting
  eventBus.on('copyPaste.pasteElement', function(context) {
    var descriptor = context.descriptor;

    if (!descriptor.parent) {
      return;
    }

    if (isCollapsedSubProcess(descriptor.parent) || descriptor.parent.hidden) {
      descriptor.hidden = true;
    }
  });

}

inherits(SubProcessPlaneBehavior, CommandInterceptor);

/**
 * Moves the child elements from source to target.
 *
 * If the target is a plane, the children are moved to the top left corner.
 * Otherwise, the center of the target is used.
 *
 * @param {Root} source
 * @param {Root} target
 */
SubProcessPlaneBehavior.prototype._moveChildrenToShape = function(source, target) {
  var modeling = this._modeling;

  var children = source.children;
  var offset;

  if (!children) {
    return;
  }

  // add external labels that weren't children of sub process
  children = children.concat(children.reduce(function(labels, child) {
    if (child.label && child.label.parent !== source) {
      return labels.concat(child.label);
    }

    return labels;
  }, []));

  // only change plane if there are no visible children, but don't move them
  var visibleChildren = children.filter(function(child) {
    return !child.hidden;
  });

  if (!visibleChildren.length) {
    modeling.moveElements(children, { x: 0, y: 0 }, target, { autoResize: false });
    return;
  }

  var childrenBounds = getBBox(visibleChildren);

  // target is a plane
  if (!target.x) {
    offset = {
      x: DEFAULT_POSITION.x - childrenBounds.x,
      y: DEFAULT_POSITION.y - childrenBounds.y
    };
  }

  // source is a plane
  else {

    // move relative to the center of the shape
    var targetMid = getMid(target);
    var childrenMid = getMid(childrenBounds);

    offset = {
      x: targetMid.x - childrenMid.x,
      y: targetMid.y - childrenMid.y
    };
  }

  modeling.moveElements(children, offset, target, { autoResize: false });
};

/**
 * Sets `hidden` property on all children of the given shape.
 *
 * @param {Element[]} elements
 * @param {boolean} [hidden=false]
 *
 * @return {Element[]}
 */
SubProcessPlaneBehavior.prototype._showRecursively = function(elements, hidden) {
  var self = this;

  var result = [];
  elements.forEach(function(element) {
    element.hidden = !!hidden;

    result = result.concat(element);

    if (element.children) {
      result = result.concat(
        self._showRecursively(element.children, element.collapsed || hidden)
      );
    }
  });

  return result;
};

/**
 * Adds a given root element to the BPMNDI diagrams.
 *
 * @param {Root|ModdleElement} planeElement
 *
 * @return {Root}
 */
SubProcessPlaneBehavior.prototype._addDiagram = function(planeElement) {
  var bpmnjs = this._bpmnjs;
  var diagrams = bpmnjs.getDefinitions().diagrams;

  if (!planeElement.businessObject) {
    planeElement = this._createNewDiagram(planeElement);
  }

  diagrams.push(planeElement.di.$parent);

  return planeElement;
};


/**
 * Creates a new plane element for the given sub process.
 *
 * @param {ModdleElement} bpmnElement
 *
 * @return {Root}
 */
SubProcessPlaneBehavior.prototype._createNewDiagram = function(bpmnElement) {
  var bpmnFactory = this._bpmnFactory,
      elementFactory = this._elementFactory;

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
    id: getPlaneIdFromShape(bpmnElement),
    type: bpmnElement.$type,
    di: diPlane,
    businessObject: bpmnElement,
    collapsed: true
  });

  return planeElement;
};

/**
 * Removes the diagram for a given root element.
 *
 * @param {Root} rootElement
 *
 * @return {ModdleElement}
 */
SubProcessPlaneBehavior.prototype._removeDiagram = function(rootElement) {
  var bpmnjs = this._bpmnjs;

  var diagrams = bpmnjs.getDefinitions().diagrams;

  var removedDiagram = find(diagrams, function(diagram) {
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
  'bpmnjs',
  'elementRegistry'
];
