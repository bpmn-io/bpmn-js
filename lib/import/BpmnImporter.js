import {
  assign
} from 'min-dash';

import { is } from '../util/ModelUtil';

import {
  isLabelExternal,
  getExternalLabelBounds,
  getLabel
} from '../util/LabelUtil';

import {
  getMid
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  isExpanded
} from '../util/DiUtil';

import {
  elementToString
} from './Util';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 *
 * @typedef {import('../features/modeling/ElementFactory').default} ElementFactory
 * @typedef {import('../draw/TextRenderer').default} TextRenderer
 *
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').Label} Label
 * @typedef {import('../model/Types').Shape} Shape
 * @typedef {import('../model/Types').Connection} Connection
 * @typedef {import('../model/Types').Root} Root
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

/**
 * @param {ModdleElement} semantic
 * @param {ModdleElement} di
 * @param {Object} [attrs=null]
 *
 * @return {Object}
 */
function elementData(semantic, di, attrs) {
  return assign({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic,
    di: di
  }, attrs);
}

function getWaypoints(di, source, target) {

  var waypoints = di.waypoint;

  if (!waypoints || waypoints.length < 2) {
    return [ getMid(source), getMid(target) ];
  }

  return waypoints.map(function(p) {
    return { x: p.x, y: p.y };
  });
}

function notYetDrawn(translate, semantic, refSemantic, property) {
  return new Error(translate('element {element} referenced by {referenced}#{property} not yet drawn', {
    element: elementToString(refSemantic),
    referenced: elementToString(semantic),
    property: property
  }));
}


/**
 * An importer that adds bpmn elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementFactory} elementFactory
 * @param {ElementRegistry} elementRegistry
 * @param {Function} translate
 * @param {TextRenderer} textRenderer
 */
export default function BpmnImporter(
    eventBus, canvas, elementFactory,
    elementRegistry, translate, textRenderer) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._elementFactory = elementFactory;
  this._elementRegistry = elementRegistry;
  this._translate = translate;
  this._textRenderer = textRenderer;
}

BpmnImporter.$inject = [
  'eventBus',
  'canvas',
  'elementFactory',
  'elementRegistry',
  'translate',
  'textRenderer'
];


/**
 * Add a BPMN element (semantic) to the canvas making it a child of the
 * given parent.
 *
 * @param {ModdleElement} semantic
 * @param {ModdleElement} di
 * @param {Shape} parentElement
 *
 * @return {Shape | Root | Connection}
 */
BpmnImporter.prototype.add = function(semantic, di, parentElement) {
  var element,
      translate = this._translate,
      hidden;

  var parentIndex;

  // ROOT ELEMENT
  // handle the special case that we deal with a
  // invisible root element (process, subprocess or collaboration)
  if (is(di, 'bpmndi:BPMNPlane')) {

    var attrs = is(semantic, 'bpmn:SubProcess')
      ? { id: semantic.id + '_plane' }
      : {};

    // add a virtual element (not being drawn)
    element = this._elementFactory.createRoot(elementData(semantic, di, attrs));

    this._canvas.addRootElement(element);
  }

  // SHAPE
  else if (is(di, 'bpmndi:BPMNShape')) {

    var collapsed = !isExpanded(semantic, di),
        isFrame = isFrameElement(semantic);

    hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    var bounds = di.bounds;

    element = this._elementFactory.createShape(elementData(semantic, di, {
      collapsed: collapsed,
      hidden: hidden,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      isFrame: isFrame
    }));

    if (is(semantic, 'bpmn:BoundaryEvent')) {
      this._attachBoundary(semantic, element);
    }

    // insert lanes behind other flow nodes (cf. #727)
    if (is(semantic, 'bpmn:Lane')) {
      parentIndex = 0;
    }

    if (is(semantic, 'bpmn:DataStoreReference')) {

      // check whether data store is inside our outside of its semantic parent
      if (!isPointInsideBBox(parentElement, getMid(bounds))) {
        parentElement = this._canvas.findRoot(parentElement);
      }
    }

    this._canvas.addShape(element, parentElement, parentIndex);
  }

  // CONNECTION
  else if (is(di, 'bpmndi:BPMNEdge')) {

    var source = this._getSource(semantic),
        target = this._getTarget(semantic);

    hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    element = this._elementFactory.createConnection(elementData(semantic, di, {
      hidden: hidden,
      source: source,
      target: target,
      waypoints: getWaypoints(di, source, target)
    }));

    if (is(semantic, 'bpmn:DataAssociation')) {

      // render always on top; this ensures DataAssociations
      // are rendered correctly across different "hacks" people
      // love to model such as cross participant / sub process
      // associations
      parentElement = this._canvas.findRoot(parentElement);
    }

    this._canvas.addConnection(element, parentElement, parentIndex);
  } else {
    throw new Error(translate('unknown di {di} for element {semantic}', {
      di: elementToString(di),
      semantic: elementToString(semantic)
    }));
  }

  // (optional) LABEL
  if (isLabelExternal(semantic) && getLabel(element)) {
    this.addLabel(semantic, di, element);
  }


  this._eventBus.fire('bpmnElement.added', { element: element });

  return element;
};


/**
 * Attach a boundary element to the given host.
 *
 * @param {ModdleElement} boundarySemantic
 * @param {Shape} boundaryElement
 */
BpmnImporter.prototype._attachBoundary = function(boundarySemantic, boundaryElement) {
  var translate = this._translate;
  var hostSemantic = boundarySemantic.attachedToRef;

  if (!hostSemantic) {
    throw new Error(translate('missing {semantic}#attachedToRef', {
      semantic: elementToString(boundarySemantic)
    }));
  }

  var host = this._elementRegistry.get(hostSemantic.id),
      attachers = host && host.attachers;

  if (!host) {
    throw notYetDrawn(translate, boundarySemantic, hostSemantic, 'attachedToRef');
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
 * Add a label to a given element.
 *
 * @param {ModdleElement} semantic
 * @param {ModdleElement} di
 * @param {Element} element
 *
 * @return {Label}
 */
BpmnImporter.prototype.addLabel = function(semantic, di, element) {
  var bounds,
      text,
      label;

  bounds = getExternalLabelBounds(di, element);

  text = getLabel(element);

  if (text) {

    // get corrected bounds from actual layouted text
    bounds = this._textRenderer.getExternalLabelBounds(bounds, text);
  }

  label = this._elementFactory.createLabel(elementData(semantic, di, {
    id: semantic.id + '_label',
    labelTarget: element,
    type: 'label',
    hidden: element.hidden || !getLabel(element),
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  }));

  return this._canvas.addShape(label, element.parent);
};

/**
 * Get the source or target of the given connection.
 *
 * @param {ModdleElement} semantic
 * @param {'source' | 'target'} side
 *
 * @return {Element}
 */
BpmnImporter.prototype._getConnectedElement = function(semantic, side) {

  var element,
      refSemantic,
      type = semantic.$type,
      translate = this._translate;

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
    throw notYetDrawn(translate, semantic, refSemantic, side + 'Ref');
  } else {
    throw new Error(translate('{semantic}#{side} Ref not specified', {
      semantic: elementToString(semantic),
      side: side
    }));
  }
};

BpmnImporter.prototype._getSource = function(semantic) {
  return this._getConnectedElement(semantic, 'source');
};

BpmnImporter.prototype._getTarget = function(semantic) {
  return this._getConnectedElement(semantic, 'target');
};


BpmnImporter.prototype._getElement = function(semantic) {
  return this._elementRegistry.get(semantic.id);
};


// helpers ////////////////////

function isPointInsideBBox(bbox, point) {
  var x = point.x,
      y = point.y;

  return x >= bbox.x &&
    x <= bbox.x + bbox.width &&
    y >= bbox.y &&
    y <= bbox.y + bbox.height;
}

function isFrameElement(semantic) {
  return is(semantic, 'bpmn:Group');
}
