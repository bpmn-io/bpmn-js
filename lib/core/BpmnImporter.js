'use strict';

var _ = require('lodash');
var Refs = require('object-refs');

function hasLabel(semantic) {
  return semantic.$instanceOf('bpmn:Event') ||
         semantic.$instanceOf('bpmn:Gateway') ||
         semantic.$instanceOf('bpmn:DataStoreReference') ||
         semantic.$instanceOf('bpmn:DataObjectReference') ||
         semantic.$instanceOf('bpmn:SequenceFlow') ||
         semantic.$instanceOf('bpmn:MessageFlow');
}


function isCollapsed(semantic) {
  return semantic.$instanceOf('bpmn:SubProcess') && !semantic.di.isExpanded;
}

function getWaypointsMid(waypoints) {

  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
}


/**
 * Returns the bounds of an elements label, parsed from the elements DI or
 * generated from its bounds.
 */
function getLabelBounds(semantic, element) {

  var mid,
      size,
      bounds,
      di = semantic.di,
      label = di.label;

  if (label && label.bounds) {
    bounds = label.bounds;

    size = {
      width: Math.max(150, bounds.width),
      height: bounds.height
    };

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y
    };
  } else {

    if (element.waypoints) {
      mid = getWaypointsMid(element.waypoints);
    } else {
      mid = {
        x: element.x + element.width / 2,
        y: element.y + element.height - 5
      };
    }

    size = {
      width: 90,
      height: 50
    };
  }

  return _.extend({
    x: mid.x - size.width / 2,
    y: mid.y
  }, size);
}


/**
 * An importer that adds bpmn elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function BpmnImporter(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;
}

BpmnImporter.$inject = [ 'eventBus', 'canvas' ];


/**
 * Add bpmn element (semantic) to the canvas onto the
 * specified parent shape.
 */
BpmnImporter.prototype.add = function(semantic, parentShape) {

  var events = this._eventBus,
      canvas = this._canvas;

  var element,
      di = semantic.di;

  /**
   * add label for the element
   */
  function addLabel(semantic, element) {
    var labelBounds = getLabelBounds(semantic, element);

    var label = canvas.create('label', _.extend({
      id: semantic.id + '_label',
      labelTarget: element,
      type: 'label',
      hidden: element.hidden,
      parent: element.parent,
      businessObject: semantic
    }, labelBounds));

    canvas.addShape(label);
  }

  // handle the special case that we deal with a
  // invisible root element (process or collaboration)
  if (di.$instanceOf('bpmndi:BPMNPlane')) {

    // add a virtual element (not being drawn)
    element = canvas.create('root', _.extend({
      id: semantic.id,
      type: semantic.$type,
      businessObject: semantic
    }));
  } else

  if (di.$instanceOf('bpmndi:BPMNShape')) {

    var bounds = di.bounds;

    var collapsed = isCollapsed(semantic);
    var hidden = parentShape && (parentShape.hidden || parentShape.collapsed);

    element = canvas.create('shape', {
      id: semantic.id,
      type: semantic.$type,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      collapsed: collapsed,
      hidden: hidden,
      parent: parentShape,
      businessObject: semantic
    });

    canvas.addShape(element);
  } else {

    var waypoints = _.collect(di.waypoint, function(p) {
      return { x: p.x, y: p.y };
    });

    element = canvas.create('connection', {
      id: semantic.id,
      type: semantic.$type,
      waypoints: waypoints,
      parent: parentShape,
      businessObject: semantic
    });

    element = canvas.addConnection(element);
  }

  if (hasLabel(semantic)) {
    addLabel(semantic, element);
  }

  this._eventBus.fire('bpmnElement.added', { element: element });

  return element;
};


module.exports = BpmnImporter;