'use strict';

var _ = require('lodash');

var LabelUtil = require('../util/Label');

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelBounds = LabelUtil.getExternalLabelBounds,
    isExpanded = require('../util/Di').isExpanded;


function elementData(semantic, attrs) {
  return _.extend({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }, attrs);
}

function collectWaypoints(waypoints) {
  return _.collect(waypoints, function(p) {
    return { x: p.x, y: p.y };
  });
}


/**
 * An importer that adds bpmn elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementFactory} elementFactory
 * @param {ElementRegistry} elementRegistry
 */
function BpmnImporter(eventBus, canvas, elementFactory, elementRegistry) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._elementFactory = elementFactory;
  this._elementRegistry = elementRegistry;
}

BpmnImporter.$inject = [ 'eventBus', 'canvas', 'elementFactory', 'elementRegistry' ];

module.exports = BpmnImporter;


/**
 * Add bpmn element (semantic) to the canvas onto the
 * specified parent shape.
 */
BpmnImporter.prototype.add = function(semantic, parentElement) {

  var di = semantic.di,
      element;

  // ROOT ELEMENT
  // handle the special case that we deal with a
  // invisible root element (process or collaboration)
  if (di.$instanceOf('bpmndi:BPMNPlane')) {

    // add a virtual element (not being drawn)
    element = this._elementFactory.createRoot(elementData(semantic));
  }

  // SHAPE
  else if (di.$instanceOf('bpmndi:BPMNShape')) {

    var collapsed = !isExpanded(semantic);
    var hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    var bounds = semantic.di.bounds;

    element = this._elementFactory.createShape(elementData(semantic, {
      collapsed: collapsed,
      hidden: hidden,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    }));

    this._canvas.addShape(element, parentElement);
  }

  // CONNECTION
  else if (di.$instanceOf('bpmndi:BPMNEdge')) {

    var source = this._getSource(semantic),
        target = this._getTarget(semantic);

    if (!source || !target) {
      throw new Error('source or target not rendered for element <' + semantic.id + '>');
    }

    element = this._elementFactory.createConnection(elementData(semantic, {
      source: source,
      target: target,
      waypoints: collectWaypoints(semantic.di.waypoint)
    }));

    this._canvas.addConnection(element, parentElement);
  } else {
    throw new Error('unknown di <' + di.$type + '> for element <' + semantic.id + '>');
  }

  // (optional) LABEL
  if (hasExternalLabel(semantic)) {
    this.addLabel(semantic, element);
  }

  this._eventBus.fire('bpmnElement.added', { element: element });

  return element;
};


/**
 * add label for an element
 */
BpmnImporter.prototype.addLabel = function (semantic, element) {
  var bounds = getExternalLabelBounds(semantic, element);

  var label = this._elementFactory.createLabel(elementData(semantic, {
    id: semantic.id + '_label',
    labelTarget: element,
    type: 'label',
    hidden: element.hidden,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  }));

  return this._canvas.addShape(label, element.parent);
};


BpmnImporter.prototype._getSource = function(semantic) {

  var element,
      elementSemantic = semantic.sourceRef;

  // handle mysterious isMany DataAssociation#sourceRef
  if (_.isArray(elementSemantic)) {
    elementSemantic = elementSemantic[0];
  }

  if (elementSemantic && elementSemantic.$instanceOf('bpmn:DataOutput')) {
    elementSemantic = elementSemantic.$parent.$parent;
  }

  element = elementSemantic && this._getElement(elementSemantic);

  if (element) {
    return element;
  }

  throw new Error('element <' + elementSemantic.id + '> referenced by <' + semantic.id + '> not yet drawn');
};


BpmnImporter.prototype._getTarget = function(semantic) {

  var element,
      elementSemantic = semantic.targetRef;

  if (elementSemantic && elementSemantic.$instanceOf('bpmn:DataInput')) {
    elementSemantic = elementSemantic.$parent.$parent;
  }

  element = elementSemantic && this._getElement(elementSemantic);

  if (element) {
    return element;
  }

  throw new Error('element <' + elementSemantic.id + '> referenced by <' + semantic.id + '> not yet drawn');
};


BpmnImporter.prototype._getElement = function(semantic) {
  return this._elementRegistry.getById(semantic.id);
};