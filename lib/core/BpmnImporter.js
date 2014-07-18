'use strict';

var _ = require('lodash');

var hasExternalLabel = require('../util/Label').hasExternalLabel,
    isExpanded = require('../util/Di').isExpanded;

/**
 * An importer that adds bpmn elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function BpmnImporter(eventBus, canvas, elementFactory) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._elementFactory = elementFactory;
}

BpmnImporter.$inject = [ 'eventBus', 'canvas', 'elementFactory' ];


/**
 * Add bpmn element (semantic) to the canvas onto the
 * specified parent shape.
 */
BpmnImporter.prototype.add = function(semantic, parentElement) {

  var di = semantic.di,
      element;

  // handle the special case that we deal with a
  // invisible root element (process or collaboration)
  if (di.$instanceOf('bpmndi:BPMNPlane')) {

    // add a virtual element (not being drawn)
    element = this._elementFactory.createRoot(semantic);
  }

  // SHAPE
  else if (di.$instanceOf('bpmndi:BPMNShape')) {

    var collapsed = !isExpanded(semantic);
    var hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    element = this._elementFactory.createShape(semantic, {
      collapsed: collapsed,
      hidden: hidden
    });

    this._canvas.addShape(element, parentElement);
  }

  // CONNECTION
  else {
    element = this._elementFactory.createConnection(semantic, parentElement);
    this._canvas.addConnection(element, parentElement);
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
  var label = this._elementFactory.createLabel(semantic, element);
  return this._canvas.addShape(label, element.parent);
};


module.exports = BpmnImporter;