'use strict';

var inherits = require('inherits');

var forEach = require('lodash/collection/forEach');

var getBoundingBox = require('diagram-js/lib/util/Elements').getBBox;
var is = require('../modeling/ModelingUtil').is,
    isExpanded = require('../../util/DiUtil').isExpanded;

var Snapping = require('diagram-js/lib/features/snapping/Snapping'),
    SnapUtil = require('diagram-js/lib/features/snapping/SnapUtil');

var is = require('../../util/ModelUtil').is;


var round = Math.round;

var mid = SnapUtil.mid,
    topLeft = SnapUtil.topLeft,
    bottomRight = SnapUtil.bottomRight,
    isSnapped = SnapUtil.isSnapped,
    setSnapped = SnapUtil.setSnapped,
    getBoundaryAttachment = require('./BpmnSnappingUtil').getBoundaryAttachment;

/**
 * BPMN specific snapping functionality
 *
 *  * snap on process elements if a pool is created inside a
 *    process diagram
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function BpmnSnapping(eventBus, canvas, bpmnRules) {

  // instantiate super
  Snapping.call(this, eventBus, canvas);


  /**
   * Drop participant on process <> process elements snapping
   */
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

    if (!isSnapped(event) && participantSnapBox) {
      snapParticipant(participantSnapBox, shape, event);
    }
  });

  eventBus.on('shape.move.start', function(event) {

    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    // snap participant around existing elements (if any)
    if (is(shape, 'bpmn:Participant') && is(rootElement, 'bpmn:Process')) {
      initParticipantSnapping(context, shape, rootElement.children);
    }
  });


  function canAttach(shape, target, position) {
    return bpmnRules.canAttach([ shape ], target, null, position) === 'attach';
  }

  /**
   * Snap boundary events to elements border
   */
  eventBus.on([ 'create.move', 'create.end' ], 1500, function(event) {

    var context = event.context,
        target = context.target,
        shape = context.shape;

    if (target && !isSnapped(event) && canAttach(shape, target, event)) {
      snapBoundaryEvent(event, shape, target);
    }
  });

  eventBus.on([ 'shape.move.move', 'shape.move.end' ], 1500, function(event) {

    var context = event.context,
        target = context.target,
        shape = context.shape;

    if (target && !isSnapped(event) && canAttach(shape, target, event)) {
      snapBoundaryEvent(event, shape, target);
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

BpmnSnapping.$inject = [ 'eventBus', 'canvas', 'bpmnRules' ];

module.exports = BpmnSnapping;


BpmnSnapping.prototype.initSnap = function(event) {

  var context = event.context,
      shape = event.shape,
      shapeMid,
      shapeBounds,
      shapeTopLeft,
      shapeBottomRight,
      snapContext;


  snapContext = Snapping.prototype.initSnap.call(this, event);

  if (is(shape, 'bpmn:Participant')) {
    // assign higher priority for outer snaps on participants
    snapContext.setSnapLocations([ 'top-left', 'bottom-right', 'mid' ]);
  }


  if (shape) {

    shapeMid = mid(shape, event);

    shapeBounds = {
      width: shape.width,
      height: shape.height,
      x: isNaN(shape.x) ? round(shapeMid.x - shape.width / 2) : shape.x,
      y: isNaN(shape.y) ? round(shapeMid.y - shape.height / 2) : shape.y,
    };

    shapeTopLeft = topLeft(shapeBounds);
    shapeBottomRight = bottomRight(shapeBounds);

    snapContext.setSnapOrigin('top-left', {
      x: shapeTopLeft.x - event.x,
      y: shapeTopLeft.y - event.y
    });

    snapContext.setSnapOrigin('bottom-right', {
      x: shapeBottomRight.x - event.x,
      y: shapeBottomRight.y - event.y
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

  }

  var source = context.source;

  if (source) {
    snapContext.addDefaultSnap('mid', mid(source));
  }
};


BpmnSnapping.prototype.addTargetSnaps = function(snapPoints, shape, target) {

  // use target parent as snap target
  if (is(shape, 'bpmn:BoundaryEvent')) {
    target = target.parent;
  }

  // add sequence flow parents as snap targets
  if (is(target, 'bpmn:SequenceFlow')) {
    this.addTargetSnaps(snapPoints, shape, target.parent);
  }

  var siblings = this.getSiblings(shape, target) || [];

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
    }

    var docking = c.waypoints[0];
    snapPoints.add(c.id + '-docking', docking.original || docking);
  });


  forEach(shape.outgoing, function(c) {

    if (siblings.indexOf(c.target) === -1) {
      snapPoints.add('mid', mid(c.target));
    }

    var docking = c.waypoints[c.waypoints.length - 1];
    snapPoints.add(c.id + '-docking', docking.original || docking);
  });
};


/////// participant snapping //////////////////

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
    setSnapped(event, 'x', snapTopLeft.x + offset + shapeHalfWidth);
  } else
  if (currentBottomRight.x <= snapBottomRight.x) {
    setSnapped(event, 'x', snapBottomRight.x - offset - shapeHalfWidth);
  }

  if (currentTopLeft.y >= snapTopLeft.y) {
    setSnapped(event, 'y', snapTopLeft.y + shapeHalfHeight);
  } else
  if (currentBottomRight.y <= snapBottomRight.y) {
    setSnapped(event, 'y', snapBottomRight.y - shapeHalfHeight);
  }
}


/////// boundary event snapping /////////////////////////


var LayoutUtil = require('diagram-js/lib/layout/LayoutUtil');


function snapBoundaryEvent(event, shape, target) {
  var targetTRBL = LayoutUtil.asTRBL(target);

  var direction = getBoundaryAttachment(event, target);

  if (/top/.test(direction)) {
    setSnapped(event, 'y', targetTRBL.top);
  } else
  if (/bottom/.test(direction)) {
    setSnapped(event, 'y', targetTRBL.bottom);
  }

  if (/left/.test(direction)) {
    setSnapped(event, 'x', targetTRBL.left);
  } else
  if (/right/.test(direction)) {
    setSnapped(event, 'x', targetTRBL.right);
  }
}