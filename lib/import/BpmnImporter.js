'use strict';

var assign = require('lodash/object/assign'),
    map = require('lodash/collection/map');

var LabelUtil = require('../util/LabelUtil');

var is = require('../util/ModelUtil').is;

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelBounds = LabelUtil.getExternalLabelBounds,
    isExpanded = require('../util/DiUtil').isExpanded,
    elementToString = require('./Util').elementToString;


function elementData(semantic, attrs) {
  return assign({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }, attrs);
}

function collectWaypoints(waypoints) {
  return map(waypoints, function(p) {
    return { x: p.x, y: p.y };
  });
}

function notYetDrawn(semantic, refSemantic, property) {
  return new Error(
      'element ' + elementToString(refSemantic) + ' referenced by ' +
      elementToString(semantic) + '#' + property + ' not yet drawn');
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

    this._canvas.setRootElement(element);
  }

  // SHAPE
  else if (di.$instanceOf('bpmndi:BPMNShape')) {

    var collapsed = !isExpanded(semantic);
    var hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    var bounds = semantic.di.bounds;

    element = this._elementFactory.createShape(elementData(semantic, {
      collapsed: collapsed,
      hidden: hidden,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    }));

    if (is(semantic, 'bpmn:BoundaryEvent')) {
      this._attachBoundary(semantic, element);
    }

    this._canvas.addShape(element, parentElement);
  }

  // CONNECTION
  else if (di.$instanceOf('bpmndi:BPMNEdge')) {

    var source = this._getSource(semantic),
        target = this._getTarget(semantic);

    element = this._elementFactory.createConnection(elementData(semantic, {
      source: source,
      target: target,
      waypoints: collectWaypoints(semantic.di.waypoint)
    }));

    this._canvas.addConnection(element, parentElement);
  } else {
    throw new Error('unknown di ' + elementToString(di) + ' for element ' + elementToString(semantic));
  }

  // (optional) LABEL
  if (hasExternalLabel(semantic)) {
    this.addLabel(semantic, element);
  }


  this._eventBus.fire('bpmnElement.added', { element: element });

  return element;
};


/**
 * Attach the boundary element to the given host
 *
 * @param {ModdleElement} boundarySemantic
 * @param {djs.model.Base} boundaryElement
 */
BpmnImporter.prototype._attachBoundary = function(boundarySemantic, boundaryElement) {

  var hostSemantic = boundarySemantic.attachedToRef;

  if (!hostSemantic) {
    throw new Error('missing ' + elementToString(boundarySemantic) + '#attachedToRef');
  }

  var host = this._elementRegistry.get(hostSemantic.id),
      attachers = host && host.attachers;

  if (!host) {
    throw notYetDrawn(boundarySemantic, hostSemantic, 'attachedToRef');
  }

  // wire element.host <> host.attachers
  boundaryElement.host = host;

  if (!attachers) {
    host.attachers = attachers = [];
  }

  if (attachers.indexOf(boundaryElement) === -1) {
    attachers.push(boundaryElement);
  }
};


/**
 * add label for an element
 */
BpmnImporter.prototype.addLabel = function(semantic, element) {
  var bounds = getExternalLabelBounds(semantic, element);

  var label = this._elementFactory.createLabel(elementData(semantic, {
    id: semantic.id + '_label',
    labelTarget: element,
    type: 'label',
    hidden: element.hidden,
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  }));

  return this._canvas.addShape(label, element.parent);
};

/**
 * Return the drawn connection end based on the given side.
 *
 * @throws {Error} if the end is not yet drawn
 */
BpmnImporter.prototype._getEnd = function(semantic, side) {

  var element,
      refSemantic,
      type = semantic.$type;

  refSemantic = semantic[side + 'Ref'];

  // handle mysterious isMany DataAssociation#sourceRef
  if (side === 'source' && type === 'bpmn:DataInputAssociation') {
    refSemantic = refSemantic && refSemantic[0];
  }

  // fix source / target for DataInputAssociation / DataOutputAssociation
  if (side === 'source' && type === 'bpmn:DataOutputAssociation' ||
      side === 'target' && type === 'bpmn:DataInputAssociation') {

    refSemantic = semantic.$parent;
  }

  element = refSemantic && this._getElement(refSemantic);

  if (element) {
    return element;
  }

  if (refSemantic) {
    throw notYetDrawn(semantic, refSemantic, side + 'Ref');
  } else {
    throw new Error(elementToString(semantic) + '#' + side + 'Ref not specified');
  }
};

BpmnImporter.prototype._getSource = function(semantic) {
  return this._getEnd(semantic, 'source');
};

BpmnImporter.prototype._getTarget = function(semantic) {
  return this._getEnd(semantic, 'target');
};


BpmnImporter.prototype._getElement = function(semantic) {
  return this._elementRegistry.get(semantic.id);
};