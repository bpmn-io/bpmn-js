import inherits from 'inherits-browser';

import BaseModeling from 'diagram-js/lib/features/modeling/Modeling';

import UpdateModdlePropertiesHandler from './cmd/UpdateModdlePropertiesHandler';
import UpdatePropertiesHandler from './cmd/UpdatePropertiesHandler';
import UpdateCanvasRootHandler from './cmd/UpdateCanvasRootHandler';
import AddLaneHandler from './cmd/AddLaneHandler';
import SplitLaneHandler from './cmd/SplitLaneHandler';
import ResizeLaneHandler from './cmd/ResizeLaneHandler';
import UpdateFlowNodeRefsHandler from './cmd/UpdateFlowNodeRefsHandler';
import IdClaimHandler from './cmd/IdClaimHandler';
import SetColorHandler from './cmd/SetColorHandler';

import UpdateLabelHandler from '../label-editing/cmd/UpdateLabelHandler';

/**
 * @typedef {import('../rules/BpmnRules').default} BpmnRules
 * @typedef {import('diagram-js/lib/command/CommandStack').default} CommandStack
 * @typedef {import('./ElementFactory').default} ElementFactory
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('diagram-js/lib/features/modeling/Modeling').ModelingHints} ModelingHints
 *
 * @typedef {import('../../model/Types').Connection} Connection
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Label} Label
 * @typedef {import('../../model/Types').Parent} Parent
 * @typedef {import('../../model/Types').Root} Root
 * @typedef {import('../../model/Types').Shape} Shape
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 *
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 *
 * @typedef {import('../../util/Types').Colors} Colors
 *
 * @typedef { {
 *   removeShape?: boolean;
 * } } UpdateLabelHints
 */

/**
 * The BPMN 2.0 modeling entry point.
 *
 * @template {Connection} [T=Connection]
 * @template {Element} [U=Element]
 * @template {Label} [V=Label]
 * @template {Parent} [W=Parent]
 * @template {Shape} [X=Shape]
 *
 * @extends {BaseModeling<T, U, V, W, X>}
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 * @param {BpmnRules} bpmnRules
 */
export default function Modeling(
    eventBus,
    elementFactory,
    commandStack,
    bpmnRules
) {

  BaseModeling.call(this, eventBus, elementFactory, commandStack);

  this._bpmnRules = bpmnRules;
}

inherits(Modeling, BaseModeling);

Modeling.$inject = [
  'eventBus',
  'elementFactory',
  'commandStack',
  'bpmnRules'
];


Modeling.prototype.getHandlers = function() {
  var handlers = BaseModeling.prototype.getHandlers.call(this);

  handlers['element.updateModdleProperties'] = UpdateModdlePropertiesHandler;
  handlers['element.updateProperties'] = UpdatePropertiesHandler;
  handlers['canvas.updateRoot'] = UpdateCanvasRootHandler;
  handlers['lane.add'] = AddLaneHandler;
  handlers['lane.resize'] = ResizeLaneHandler;
  handlers['lane.split'] = SplitLaneHandler;
  handlers['lane.updateRefs'] = UpdateFlowNodeRefsHandler;
  handlers['id.updateClaim'] = IdClaimHandler;
  handlers['element.setColor'] = SetColorHandler;
  handlers['element.updateLabel'] = UpdateLabelHandler;

  return handlers;
};

/**
 * Update an element's label.
 *
 * @param {Element} element The element.
 * @param {string} newLabel The new label.
 * @param {Rect} [newBounds] The optional bounds of the label.
 * @param {UpdateLabelHints} [hints] The optional hints.
 */
Modeling.prototype.updateLabel = function(element, newLabel, newBounds, hints) {
  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel,
    newBounds: newBounds,
    hints: hints || {}
  });
};

/**
 * @param {Element} source
 * @param {Element} target
 * @param {Partial<Connection>} attrs
 * @param {ModelingHints} [hints]
 *
 * @return {T}
 */
Modeling.prototype.connect = function(source, target, attrs, hints) {

  var bpmnRules = this._bpmnRules;

  if (!attrs) {
    attrs = bpmnRules.canConnect(source, target);
  }

  if (!attrs) {
    return;
  }

  return this.createConnection(source, target, attrs, source.parent, hints);
};

/**
 * Update a model element's properties.
 *
 * @param {Element} element The element.
 * @param {ModdleElement} moddleElement The model element.
 * @param {Object} properties The updated properties.
 */
Modeling.prototype.updateModdleProperties = function(element, moddleElement, properties) {
  this._commandStack.execute('element.updateModdleProperties', {
    element: element,
    moddleElement: moddleElement,
    properties: properties
  });
};

/**
 * Update an element's properties.
 *
 * @param {Element} element The element.
 * @param {Object} properties The updated properties.
 */
Modeling.prototype.updateProperties = function(element, properties) {
  this._commandStack.execute('element.updateProperties', {
    element: element,
    properties: properties
  });
};

/**
 * Resize a lane.
 *
 * @param {Shape} laneShape The lane.
 * @param {Rect} newBounds The new bounds of the lane.
 * @param {boolean} [balanced] Wether to resize neighboring lanes.
 */
Modeling.prototype.resizeLane = function(laneShape, newBounds, balanced) {
  this._commandStack.execute('lane.resize', {
    shape: laneShape,
    newBounds: newBounds,
    balanced: balanced
  });
};

/**
 * Add a lane.
 *
 * @param {Shape} targetLaneShape The shape to add the lane to.
 * @param {string} location The location.
 *
 * @return {Shape} The added lane.
 */
Modeling.prototype.addLane = function(targetLaneShape, location) {
  var context = {
    shape: targetLaneShape,
    location: location
  };

  this._commandStack.execute('lane.add', context);

  return context.newLane;
};

/**
 * Split a lane.
 *
 * @param {Shape} targetLane The lane to split.
 * @param {number} count The number of lanes to split the lane into. Must not
 * exceed the number of existing lanes.
 */
Modeling.prototype.splitLane = function(targetLane, count) {
  this._commandStack.execute('lane.split', {
    shape: targetLane,
    count: count
  });
};

/**
 * Turn a process into a collaboration.
 *
 * @return {Root} The root of the collaboration.
 */
Modeling.prototype.makeCollaboration = function() {

  var collaborationElement = this._create('root', {
    type: 'bpmn:Collaboration'
  });

  var context = {
    newRoot: collaborationElement
  };

  this._commandStack.execute('canvas.updateRoot', context);

  return collaborationElement;
};

/**
 * Transform a collaboration into a process.
 *
 * @return {Root} The root of the process.
 */
Modeling.prototype.makeProcess = function() {

  var processElement = this._create('root', {
    type: 'bpmn:Process'
  });

  var context = {
    newRoot: processElement
  };

  this._commandStack.execute('canvas.updateRoot', context);
};

/**
 * Update the referenced lanes of each flow node.
 *
 * @param {Shape[]} flowNodeShapes The flow nodes to update.
 * @param {Shape[]} laneShapes The lanes.
 */
Modeling.prototype.updateLaneRefs = function(flowNodeShapes, laneShapes) {

  this._commandStack.execute('lane.updateRefs', {
    flowNodeShapes: flowNodeShapes,
    laneShapes: laneShapes
  });
};

/**
 * Claim an ID.
 *
 * @param {string} id The ID to claim.
 * @param {ModdleElement} moddleElement The model element the ID is claimed for.
 */
Modeling.prototype.claimId = function(id, moddleElement) {
  this._commandStack.execute('id.updateClaim', {
    id: id,
    element: moddleElement,
    claiming: true
  });
};

/**
 * Unclaim an ID.
 *
 * @param {string} id The ID to unclaim.
 * @param {ModdleElement} moddleElement The model element the ID is claimed for.
 */
Modeling.prototype.unclaimId = function(id, moddleElement) {
  this._commandStack.execute('id.updateClaim', {
    id: id,
    element: moddleElement
  });
};

/**
 * Set the color(s) of one or many elements.
 *
 * @param {Element[]} elements The elements to set the color(s) for.
 * @param {Colors} colors The color(s) to set.
 */
Modeling.prototype.setColor = function(elements, colors) {
  if (!elements.length) {
    elements = [ elements ];
  }

  this._commandStack.execute('element.setColor', {
    elements: elements,
    colors: colors
  });
};
