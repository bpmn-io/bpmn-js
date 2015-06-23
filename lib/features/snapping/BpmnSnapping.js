'use strict';

var inherits = require('inherits');

var forEach = require('lodash/collection/forEach'),
    values = require('lodash/object/values');

var getBoundingBox = require('diagram-js/lib/util/Elements').getBBox;
var is = require('../modeling/ModelingUtil').is,
    isExpanded = require('../../util/DiUtil').isExpanded;

var Snapping = require('diagram-js/lib/features/snapping/Snapping'),
    SnapUtil = require('diagram-js/lib/features/snapping/SnapUtil');

var is = require('../../util/ModelUtil').is;


var mid = SnapUtil.mid,
    topLeft = SnapUtil.topLeft,
    bottomRight = SnapUtil.bottomRight,
    calcSnapEdges = SnapUtil.calcSnapEdges,
    closestEdge = SnapUtil.closestEdge;

/**
 * BPMN specific snapping functionality
 *
 *  * snap on process elements if a pool is created inside a
 *    process diagram
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function BpmnSnapping(eventBus, canvas) {

  // instantiate super
  Snapping.call(this, eventBus, canvas);

  /**
   * Drop participant on process <> process elements snapping
   */

  function initParticipantSnapping(context, shape, elements) {

    if (!elements.length) {
      return;
    }

    var snapBox = getBoundingBox(elements.filter(function(e) {
      return !e.labelTarget && !e.waypoints;
    }));

    snapBox.x -= 50;
    snapBox.y -= 20;
    snapBox.width += 70;
    snapBox.height += 40;

    // adjust shape height to include bounding box
    shape.width = Math.max(shape.width, snapBox.width);
    shape.height = Math.max(shape.height, snapBox.height);

    context.participantSnapBox = snapBox;
  }

  function snapParticipant(snapBox, shape, event, offset) {
    offset = offset || 0;

    var shapeHalfWidth = shape.width / 2 - offset,
        shapeHalfHeight = shape.height / 2;

    var currentTopLeft = {
      x: event.x - shapeHalfWidth - offset,
      y: event.y - shapeHalfHeight
    };

    var currentBottomRight = {
      x: event.x + shapeHalfWidth + offset,
      y: event.y + shapeHalfHeight
    };

    var snapTopLeft = snapBox,
        snapBottomRight = bottomRight(snapBox);

    if (currentTopLeft.x >= snapTopLeft.x) {
      event.x = snapTopLeft.x + offset + shapeHalfWidth;
      event.snapped = true;
    } else
    if (currentBottomRight.x <= snapBottomRight.x) {
      event.x = snapBottomRight.x - offset - shapeHalfWidth;
      event.snapped = true;
    }

    if (currentTopLeft.y >= snapTopLeft.y) {
      event.y = snapTopLeft.y + shapeHalfHeight;
      event.snapped = true;
    } else
    if (currentBottomRight.y <= snapBottomRight.y) {
      event.y = snapBottomRight.y - shapeHalfHeight;
      event.snapped = true;
    }
  }


  eventBus.on('create.start', function(event) {

    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    // snap participant around existing elements (if any)
    if (is(shape, 'bpmn:Participant') && is(rootElement, 'bpmn:Process')) {
      initParticipantSnapping(context, shape, rootElement.children);
    }
  });

  eventBus.on([ 'create.move', 'create.end' ], 1500, function(event) {

    var context = event.context,
        shape = context.shape,
        participantSnapBox = context.participantSnapBox;

    if (!event.snapped && participantSnapBox) {
      snapParticipant(participantSnapBox, shape, event);
    }
  });

  eventBus.on([  'create.end', 'shape.move.end' ], 1500, function(event) {
    var context = event.context;

    if (context.canExecute === 'attach') {
      snapBoundaryEvents(event);
    }

  });

  eventBus.on('resize.start', 1500, function(event) {
    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:SubProcess') && isExpanded(shape)) {
        context.minDimensions = { width: 140, height: 120 };
    }

    if (is(shape, 'bpmn:Participant')) {
      context.minDimensions = { width: 300, height: 150 };
      context.childrenBoxPadding = {
        left: 50,
        right: 35
      };
    }

    if (is(shape, 'bpmn:TextAnnotation')) {
      context.minDimensions = { width: 50, height: 50 };
    }
  });

}

inherits(BpmnSnapping, Snapping);

BpmnSnapping.$inject = [ 'eventBus', 'canvas' ];

module.exports = BpmnSnapping;


function whichAxis(edge) {
  if (/top|bottom/.test(edge)) {
    return 'y';
  }
  if (/left|right/.test(edge)) {
    return 'x';
  }
}

function snapBoundaryEvents(event) {
  var context = event.context,
      target = context.target;

  var snapLocationPoints = {
    'top': target.y,
    'bottom': target.y + target.height,
    'left': target.x,
    'right': target.x + target.width,
  };

  var bounds = {
    x: event.x,
    y: event.y
  };

  var edge = closestEdge(bounds, target);

  var axis = whichAxis(edge);

  var snapping = {};

  var locationSnapping = snapLocationPoints[edge];

  snapping[axis] = locationSnapping;

  // adjust event { x, y, dx, dy } and mark as snapping
  var cx, cy;

  if (snapping.x) {

    cx = event.x - snapping.x;

    event.x = snapping.x;
    event.dx = event.dx - cx;

    if (context.delta) {
      cx = (snapping.x - 18) - event.shape.x;

      context.delta.x = cx;
    }

    event.snapped = true;
  }

  if (snapping.y) {
    cy = event.y - snapping.y;

    event.y = snapping.y;
    event.dy = event.dy - cy;

    if (context.delta) {
      cy = (snapping.y - 18) - event.shape.y;

      context.delta.y = cy;
    }

    event.snapped = true;
  }

}

BpmnSnapping.prototype.initSnap = function(event) {

  var context = event.context,
      shape = event.shape,
      snapContext,
      snapEdges;


  snapContext = Snapping.prototype.initSnap.call(this, event);

  if (is(shape, 'bpmn:Participant')) {
    // assign higher priority for outer snaps on participants
    snapContext.setSnapLocations([ 'top-left', 'bottom-right', 'mid' ]);
  }

  if (shape) {

    snapEdges = calcSnapEdges(event, shape);

    forEach(snapEdges, function(bounds, location) {
      snapContext.setSnapOrigin(location, bounds);
    });

    forEach(shape.outgoing, function(c) {
      var docking = c.waypoints[0];

      docking = docking.original || docking;

      snapContext.setSnapOrigin(c.id + '-docking', {
        x: docking.x - event.x,
        y: docking.y - event.y
      });
    });

    forEach(shape.incoming, function(c) {
      var docking = c.waypoints[c.waypoints.length - 1];

      docking = docking.original || docking;

      snapContext.setSnapOrigin(c.id + '-docking', {
        x: docking.x - event.x,
        y: docking.y - event.y
      });
    });


<<<<<<< HEAD
    var source = context.source,
        connectedShapes,
        shapeOrigin;

    if (is(shape, 'bpmn:FlowNode')) {

      connectedShapes = getConnectedShapes(shape);

      // add snapping to source element (inline elements during attach)
      if (source) {
        snapContext.addDefaultSnap('mid', mid(source));

        connectedShapes.push(source);
      }

      shapeOrigin = {
        x: shapeMid.x - event.x,
        y: shapeMid.y - event.y
      };

      // add distance guides (better placement on diagram)
      this.addDistanceSnapping(snapContext, shape, shapeOrigin, connectedShapes);
    }
  }
};

BpmnSnapping.prototype.addDistanceSnapping = function(snapContext, shape, shapeOrigin, connectedShapes, location) {

  var self = this;

  snapContext.setSnapOrigin('distance', shapeOrigin);

  var axisDistance = {
    x: 80,
=======

  var source = context.source,
      connectedShapes;

  if (is(shape, 'bpmn:FlowNode')) {

    connectedShapes = getConnectedShapes(shape);

    // add snapping to source element (inline elements during attach)
    if (source) {
      snapContext.addDefaultSnap('mid', mid(source));

      connectedShapes.push(source);
    }

    // add distance guides (better placement on diagram)
    this.addDistanceSnapping(snapContext, shape, connectedShapes);
  }
};

BpmnSnapping.prototype.addDistanceSnapping = function(snapContext, shape, connectedShapes) {

  var self = this;

  var axisDistance = {
    x: 100,
>>>>>>> asdasd
    y: 50
  };

  forEach(connectedShapes, function(connectedShape) {
<<<<<<< HEAD
    self.addDefaultDistanceSnaps(snapContext, shape, connectedShape, axisDistance, 'distance');
=======
    self.addDefaultDistanceSnaps(snapContext, shape, connectedShape, axisDistance);
>>>>>>> asdasd
  });
};


BpmnSnapping.prototype.addTargetSnaps = function(snapPoints, shape, target) {

  var siblings = this.getSiblings(shape, target);

  if (is(target, 'bpmn:SequenceFlow')) {
    this.addTargetSnaps(snapPoints, shape, target.parent);
  }

  forEach(siblings, function(s) {
    snapPoints.add('mid', mid(s));

    if (is(s, 'bpmn:Participant')) {
      snapPoints.add('top-left', topLeft(s));
      snapPoints.add('bottom-right', bottomRight(s));
    }
  });

  forEach(shape.incoming, function(c) {

    if (siblings.indexOf(c.source) === -1) {
      snapPoints.add('mid', mid(c.source));

      var docking = c.waypoints[0];
      snapPoints.add(c.id + '-docking', docking.original || docking);
    }
  });


  forEach(shape.outgoing, function(c) {

    if (siblings.indexOf(c.target) === -1) {
      snapPoints.add('mid', mid(c.target));

      var docking = c.waypoints[c.waypoints.length - 1];
      snapPoints.add(c.id + '-docking', docking.original || docking);
    }
  });

};


//////// helper functions /////////////////////////////////////////

/**
 * Return all shapes that are connected to the argument
 * via incoming / outgoing connections.
 *
 * @param  {djs.model.Shape} shape
 *
 * @return {Array<djs.model.Shape>}
 */
function getConnectedShapes(shape) {

  var connected = {};

  forEach(shape.incoming, function(connection) {
    var s = connection.source;
    connected[s.id] = s;
  });

  forEach(shape.outgoing, function(connection) {
    var s = connection.target;
    connected[s.id] = s;
  });

  return values(connected);
}