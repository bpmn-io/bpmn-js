import inherits from 'inherits';

import CreateMoveSnapping from 'diagram-js/lib/features/snapping/CreateMoveSnapping';

import {
  isSnapped,
  setSnapped,
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { is } from '../../util/ModelUtil';

import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';

import { getBoundaryAttachment } from './BpmnSnappingUtil';

var HIGH_PRIORITY = 1500;


/**
 * Snap during create and move.
 *
 * @param {BpmnRules} bpmnRules
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function BpmnCreateMoveSnapping(bpmnRules, eventBus, injector) {
  injector.invoke(CreateMoveSnapping, this);

  // creating first participant
  eventBus.on([ 'create.move', 'create.end' ], HIGH_PRIORITY, setSnappedIfConstrained);

  function canAttach(shape, target, position) {
    return bpmnRules.canAttach([ shape ], target, null, position) === 'attach';
  }

  // snap boundary events
  eventBus.on([
    'create.move',
    'create.end',
    'shape.move.move',
    'shape.move.end'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        target = context.target,
        shape = context.shape;

    if (target && canAttach(shape, target, event) && !isSnapped(event)) {
      snapBoundaryEvent(event, target);
    }
  });
}

inherits(BpmnCreateMoveSnapping, CreateMoveSnapping);

BpmnCreateMoveSnapping.$inject = [
  'bpmnRules',
  'eventBus',
  'injector'
];

BpmnCreateMoveSnapping.prototype.initSnap = function(event) {
  var snapContext = CreateMoveSnapping.prototype.initSnap.call(this, event);

  var shape = event.shape;

  if (is(shape, 'bpmn:Participant')) {

    // snap to borders with higher priority
    snapContext.setSnapLocations([ 'top-left', 'bottom-right', 'mid' ]);
  }

  return snapContext;
};

BpmnCreateMoveSnapping.prototype.addSnapTargetPoints = function(snapPoints, shape, target) {
  CreateMoveSnapping.prototype.addSnapTargetPoints.call(this, snapPoints, shape, target);

  // add sequence flow parents as snap targets
  if (is(target, 'bpmn:SequenceFlow')) {
    snapPoints = this.addSnapTargetPoints(snapPoints, shape, target.parent);
  }

  return snapPoints;
};

BpmnCreateMoveSnapping.prototype.getSnapTargets = function(shape, target) {
  return CreateMoveSnapping.prototype.getSnapTargets.call(this, shape, target)
    .filter(function(snapTarget) {

      // do not snap to lanes
      return !is(snapTarget, 'bpmn:Lane');
    });
};

// helpers //////////

function snapBoundaryEvent(event, target) {
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