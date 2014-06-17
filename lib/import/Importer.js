'use strict';

var _ = require('lodash');

var BpmnTreeWalker = require('./BpmnTreeWalker'),
    Util = require('../Util');


function hasLabel(element) {

  return element.$instanceOf('bpmn:Event') ||
         element.$instanceOf('bpmn:Gateway') ||
         element.$instanceOf('bpmn:DataStoreReference') ||
         element.$instanceOf('bpmn:DataObjectReference') ||
         element.$instanceOf('bpmn:SequenceFlow') ||
         element.$instanceOf('bpmn:MessageFlow');
}


function isCollapsed(element, di) {
  return element.$instanceOf('bpmn:SubProcess') && di && !di.isExpanded;
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


function importBpmnDiagram(diagram, definitions, done) {

  var canvas = diagram.get('canvas');
  var events = diagram.get('eventBus');


  function addLabel(element, di, data) {
    if (!hasLabel(element)) {
      return;
    }

    var labelBounds = getLabelBounds(di, data);

    var label = _.extend({
      id: element.id + '_label',
      attachedId: element.id,
      type: 'label'
    }, labelBounds);

    canvas.addShape(label);

    // we wire data and label so that
    // the label of a BPMN element can be quickly accessed via
    // element.label in various components
    data.label = label;
  }


  var visitor = {

    element: function(element, di, parent) {

      var shape;

      function fire(type, shape) {
        events.fire('bpmn.element.' + type, {
          semantic: element, di: di, diagramElement: shape
        });
      }

      if (di.$type === 'bpmndi:BPMNShape') {
        var bounds = di.bounds;

        var collapsed = isCollapsed(element, di);
        var hidden = parent && (parent.hidden || parent.collapsed);

        shape = {
          id: element.id, type: element.$type,
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

        shape = { id: element.id, type: element.$type, waypoints: waypoints };

        fire('add', shape);
        canvas.addConnection(shape);
      }

      fire('added', shape);

      // add label if needed
      addLabel(element, di, shape);

      return shape;
    },

    error: function(message, context) {
      console.warn('[import]', message, context);
    }
  };

  var walker = new BpmnTreeWalker(visitor);
  walker.handleDefinitions(definitions);

  done();
}

module.exports.importBpmnDiagram = Util.failSafeAsync(importBpmnDiagram);