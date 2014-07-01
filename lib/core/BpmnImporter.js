'use strict';

var _ = require('lodash');


function hasLabel(semantic) {
  return semantic.$instanceOf('bpmn:Event') ||
         semantic.$instanceOf('bpmn:Gateway') ||
         semantic.$instanceOf('bpmn:DataStoreReference') ||
         semantic.$instanceOf('bpmn:DataObjectReference') ||
         semantic.$instanceOf('bpmn:SequenceFlow') ||
         semantic.$instanceOf('bpmn:MessageFlow');
}


function isCollapsed(semantic, di) {
  return semantic.$instanceOf('bpmn:SubProcess') && di && !di.isExpanded;
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
function getLabelBounds(di, data) {

  var mid,
      size;

  var label = di.label;
  if (label && label.bounds) {
    var bounds = label.bounds;

    size = {
      width: Math.max(150, bounds.width),
      height: bounds.height
    };

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y
    };
  } else {

    if (data.waypoints) {
      mid = getWaypointsMid(data.waypoints);
    } else {
      mid = {
        x: data.x + data.width / 2,
        y: data.y + data.height - 5
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
 * Add bpmn element (semantic, di) to the canvas onto the
 * specified parent element.
 */
BpmnImporter.prototype.add = function(semantic, di, parent) {

  var events = this._eventBus,
      canvas = this._canvas;

  var shape;

  /**
   * fire element specific event
   */
  function fire(type, shape) {
    events.fire('bpmn.element.' + type, {
      semantic: semantic, di: di, diagramElement: shape
    });
  }

  /**
   * add label for the element
   */
  function addLabel(semantic, di, data) {
    if (!hasLabel(semantic)) {
      return;
    }

    var labelBounds = getLabelBounds(di, data);

    var label = _.extend({
      id: semantic.id + '_label',
      attachedId: semantic.id,
      type: 'label',
      hidden: data.hidden
    }, labelBounds);

    canvas.addShape(label);

    // we wire data and label so that
    // the label of a BPMN element can be quickly accessed via
    // element.label in various components
    data.label = label;
  }

  // handle the special case that we deal with a
  // invisible root element (process or collaboration)
  if (di.$instanceOf('bpmndi:BPMNPlane')) {

    // we still fire the added event, making sure our
    // infrastructure pics it up properly
    fire('add', null);
    fire('added', null);

    return null;
  }

  if (di.$instanceOf('bpmndi:BPMNShape')) {

    var bounds = di.bounds;

    var collapsed = isCollapsed(semantic, di);
    var hidden = parent && (parent.hidden || parent.collapsed);

    shape = {
      id: semantic.id, type: semantic.$type,
      x: bounds.x, y: bounds.y,
      width: bounds.width, height: bounds.height,
      collapsed: collapsed,
      hidden: hidden,
      parent: parent
    };

    fire('add', shape);
    canvas.addShape(shape);
  } else {

    var waypoints = _.collect(di.waypoint, function(p) {
      return { x: p.x, y: p.y };
    });

    shape = { id: semantic.id, type: semantic.$type, waypoints: waypoints };

    fire('add', shape);
    canvas.addConnection(shape);
  }

  fire('added', shape);

  // add label if needed
  addLabel(semantic, di, shape);

  return shape;
};


module.exports = BpmnImporter;