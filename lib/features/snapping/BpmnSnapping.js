import inherits from 'inherits';

import {
  forEach,
  isNumber
} from 'min-dash';

import Snapping from 'diagram-js/lib/features/snapping/Snapping';

import { is } from '../../util/ModelUtil';

import { isAny } from '../modeling/util/ModelingUtil';

import { isExpanded } from '../../util/DiUtil';

import {
  bottomRight,
  isSnapped,
  mid,
  setSnapped,
  topLeft
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';

import {
  getBoundaryAttachment,
  getParticipantSizeConstraints
} from './BpmnSnappingUtil';

import { getLanesRoot } from '../modeling/util/LaneUtil';

var round = Math.round;

var HIGH_PRIORITY = 1500;


/**
 * BPMN-specific snapping.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function BpmnSnapping(bpmnRules, canvas, elementRegistry, eventBus) {
  Snapping.call(this, eventBus, canvas);

  function canAttach(shape, target, position) {
    return bpmnRules.canAttach([ shape ], target, null, position) === 'attach';
  }

  function canConnect(source, target) {
    return bpmnRules.canConnect(source, target);
  }

  // creating first participant
  eventBus.on([ 'create.move', 'create.end' ], HIGH_PRIORITY, setSnappedIfConstrained);

  /**
   * Snap boundary events to elements border
   */
  eventBus.on([
    'create.move',
    'create.end',
    'shape.move.move',
    'shape.move.end'
  ], HIGH_PRIORITY, function(event) {

    var context = event.context,
        target = context.target,
        shape = context.shape;

    if (target && !isSnapped(event) && canAttach(shape, target, event)) {
      snapBoundaryEvent(event, shape, target);
    }
  });

  /**
   * Adjust parent for flowElements to the target participant
   * when droping onto lanes.
   */
  eventBus.on([
    'shape.move.hover',
    'shape.move.move',
    'shape.move.end',
    'create.hover',
    'create.move',
    'create.end'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        hover = event.hover;

    if (is(hover, 'bpmn:Lane') && !isAny(shape, [ 'bpmn:Lane', 'bpmn:Participant' ])) {
      event.hover = getLanesRoot(hover);
      event.hoverGfx = elementRegistry.getGraphics(event.hover);
    }
  });

  /**
   * Snap sequence flows.
   */
  eventBus.on([
    'connect.move',
    'connect.hover',
    'connect.end'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        source = context.source,
        target = context.target;

    var connection = canConnect(source, target) || {};

    if (!context.initialSourcePosition) {
      context.initialSourcePosition = context.sourcePosition;
    }

    if (
      target && (
        connection.type === 'bpmn:Association' ||
        connection.type === 'bpmn:DataOutputAssociation' ||
        connection.type === 'bpmn:DataInputAssociation' ||
        connection.type === 'bpmn:SequenceFlow'
      )
    ) {
      // snap source
      context.sourcePosition = mid(source);

      // snap target
      snapToPosition(event, mid(target));
    } else

    if (connection.type === 'bpmn:MessageFlow') {

      if (is(source, 'bpmn:Event')) {
        // snap source
        context.sourcePosition = mid(source);
      }

      if (is(target, 'bpmn:Event')) {
        // snap target
        snapToPosition(event, mid(target));
      }
    }

    else {
      // otherwise reset source snap
      context.sourcePosition = context.initialSourcePosition;
    }

  });


  eventBus.on('resize.start', HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:SubProcess') && isExpanded(shape)) {
      context.minDimensions = { width: 140, height: 120 };
    }

    if (is(shape, 'bpmn:Participant')) {
      context.minDimensions = { width: 300, height: 150 };
    }

    if (is(shape, 'bpmn:Lane') || is(shape, 'bpmn:Participant')) {
      context.resizeConstraints = getParticipantSizeConstraints(
        shape,
        context.direction,
        context.balanced
      );
    }

    if (is(shape, 'bpmn:TextAnnotation')) {
      context.minDimensions = { width: 50, height: 30 };
    }
  });

}

inherits(BpmnSnapping, Snapping);

BpmnSnapping.$inject = [
  'bpmnRules',
  'canvas',
  'elementRegistry',
  'eventBus'
];

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

    // snap to borders with higher priority
    snapContext.setSnapLocations([ 'top-left', 'bottom-right', 'mid' ]);
  }


  if (shape) {

    shapeMid = mid(shape, event);

    shapeBounds = {
      width: shape.width,
      height: shape.height,
      x: isNaN(shape.x) ? round(shapeMid.x - shape.width / 2) : shape.x,
      y: isNaN(shape.y) ? round(shapeMid.y - shape.height / 2) : shape.y
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

  // snap shape to itself
  if (isNumber(shape.x) && isNumber(shape.y)) {
    snapPoints.add('mid', mid(shape));
  }

  // use target parent as snap target
  if (is(shape, 'bpmn:BoundaryEvent') && shape.type !== 'label') {
    target = target.parent;
  }

  // add sequence flow parents as snap targets
  if (is(target, 'bpmn:SequenceFlow')) {
    this.addTargetSnaps(snapPoints, shape, target.parent);
  }

  var siblings = this.getSiblings(shape, target) || [];

  forEach(siblings, function(sibling) {

    // do not snap to lanes
    if (is(sibling, 'bpmn:Lane')) {
      return;
    }

    if (sibling.waypoints) {

      forEach(sibling.waypoints.slice(1, -1), function(waypoint, i) {
        var nextWaypoint = sibling.waypoints[i + 2],
            previousWaypoint = sibling.waypoints[i];

        if (!nextWaypoint || !previousWaypoint) {
          throw new Error('waypoints must exist');
        }

        if (nextWaypoint.x === waypoint.x ||
            nextWaypoint.y === waypoint.y ||
            previousWaypoint.x === waypoint.x ||
            previousWaypoint.y === waypoint.y) {
          snapPoints.add('mid', waypoint);
        }
      });

      return;
    }

    snapPoints.add('mid', mid(sibling));

    if (is(sibling, 'bpmn:Participant')) {
      snapPoints.add('top-left', topLeft(sibling));
      snapPoints.add('bottom-right', bottomRight(sibling));
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

// helpers //////////

function snapBoundaryEvent(event, shape, target) {
  var targetTRBL = asTRBL(target);

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


function snapToPosition(event, position) {
  setSnapped(event, 'x', position.x);
  setSnapped(event, 'y', position.y);
}

function setSnappedIfConstrained(event) {
  var context = event.context,
      createConstraints = context.createConstraints;

  if (!createConstraints) {
    return;
  }

  var top = createConstraints.top,
      right = createConstraints.right,
      bottom = createConstraints.bottom,
      left = createConstraints.left;

  if ((left && left >= event.x) || (right && right <= event.x)) {
    setSnapped(event, 'x', event.x);
  }

  if ((top && top >= event.y) || (bottom && bottom <= event.y)) {
    setSnapped(event, 'y', event.y);
  }
}