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
 * @typedef {import('diagram-js/lib/model').Base} Base
 * @typedef {import('diagram-js/lib/model').Connection} Connection
 * @typedef {import('diagram-js/lib/model').Parent} Parent
 * @typedef {import('diagram-js/lib/model').Shape} Shape
 * @typedef {import('diagram-js/lib/model').Label} Label
 * @typedef {import('diagram-js/lib/model').ModelAttrsConnection} ModelAttrsConnection
 * @typedef {import('diagram-js/lib/model').ModelAttrsLabel} ModelAttrsLabel
 * @typedef {import('diagram-js/lib/model').ModelAttrsShape} ModelAttrsShape
 *
 * @typedef {import('diagram-js/lib/command/CommandStack').default} CommandStack
 * @typedef {import('diagram-js/lib/core/ElementFactory').default} ElementFactory
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('diagram-js/lib/command/CommandStack').CommandHandlerConstructor} CommandHandlerConstructor
 *
 * @typedef {import('diagram-js/lib/util/Types').Dimensions} Dimensions
 * @typedef {import('diagram-js/lib/util/Types').Direction} Direction
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 *
 * @typedef {import('diagram-js/lib/features/Modeling').ModelingHints} ModelingHints
 *
 * @typedef {import('../../BaseViewer').ModdleElement} ModdleElement
 */

/**
 * BPMN 2.0 modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 * @param {BpmnRules} bpmnRules
 */
export default function Modeling(
    eventBus, elementFactory, commandStack,
    bpmnRules) {

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

/**
 * Get a map of all command handlers.
 *
 * @returns {Map<string, CommandHandlerConstructor>} Map of all command handlers.
 */
Modeling.prototype.getHandlers = function() {
  const handlers = BaseModeling.prototype.getHandlers.call(this);

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
 * Get a map of all command handlers.
 *
 * @param {Base} element
 * @param {Label} newLabel
 * @param {Rect} [newBounds]
 * @param {ModelingHints} [hints]
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
 * Get a map of all command handlers.
 *
 * @param {Base} source
 * @param {Base} target
 * @param {Object} [attrs]
 * @param {ModelingHints} [hints]
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
 * Get a map of all command handlers.
 *
 * @param {Base} element
 * @param {ModdleElement} moddleElement
 * @param {Object} properties
 */
Modeling.prototype.updateModdleProperties = function(element, moddleElement, properties) {
  this._commandStack.execute('element.updateModdleProperties', {
    element: element,
    moddleElement: moddleElement,
    properties: properties
  });
};

/**
 * Get a map of all command handlers.
 *
 * @param {Base} element
 * @param {Object} properties
 */
Modeling.prototype.updateProperties = function(element, properties) {
  this._commandStack.execute('element.updateProperties', {
    element: element,
    properties: properties
  });
};

/**
 * Get a map of all command handlers.
 *
 * @param {Base} laneShape
 * @param {Rect} newBounds
 * @param {boolean} [balanced]
 */
Modeling.prototype.resizeLane = function(laneShape, newBounds, balanced) {
  this._commandStack.execute('lane.resize', {
    shape: laneShape,
    newBounds: newBounds,
    balanced: balanced
  });
};

/**
 * Get a map of all command handlers.
 *
 * @param {Shape} targetLaneShape
 * @param {DirectionTRBL} [location]
 * @returns {Shape} A new Lane shape instance.
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
 * Get a map of all command handlers.
 *
 * @param {Shape} targetLane
 * @param {number} count
 */
Modeling.prototype.splitLane = function(targetLane, count) {
  this._commandStack.execute('lane.split', {
    shape: targetLane,
    count: count
  });
};

/**
 * Transform the current diagram into a collaboration.
 *
 * @return {Root} the new root element
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
 * Get a map of all command handlers.
 *
 * @param {Shape[]} flowNodeShapes
 * @param {Shape[]} laneShapes
 */
Modeling.prototype.updateLaneRefs = function(flowNodeShapes, laneShapes) {

  this._commandStack.execute('lane.updateRefs', {
    flowNodeShapes: flowNodeShapes,
    laneShapes: laneShapes
  });
};

/**
 * Transform the current diagram into a process.
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
 * Get a map of all command handlers.
 *
 * @param {string} id
 * @param {ModdleElement} moddleElement
 */
Modeling.prototype.claimId = function(id, moddleElement) {
  this._commandStack.execute('id.updateClaim', {
    id: id,
    element: moddleElement,
    claiming: true
  });
};

/**
 * Get a map of all command handlers.
 *
 * @param {string} id
 * @param {ModdleElement} moddleElement
 */
Modeling.prototype.unclaimId = function(id, moddleElement) {
  this._commandStack.execute('id.updateClaim', {
    id: id,
    element: moddleElement
  });
};

/**
 * Get a map of all command handlers.
 *
 * @param {Base|Base[]} elements
 * @param {{fill: string; stroke: string}} colors
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
