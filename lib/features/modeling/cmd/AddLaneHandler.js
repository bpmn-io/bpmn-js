import {
  filter
} from 'min-dash';

import {
  eachElement
} from 'diagram-js/lib/util/Elements';

import {
  getLanesRoot,
  getChildLanes,
  LANE_INDENTATION
} from '../util/LaneUtil';

import {
  isHorizontal
} from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('../../space-tool/BpmnSpaceTool').default} SpaceTool
 */

/**
 * A handler that allows us to add a new lane
 * above or below an existing one.
 *
 * @implements {CommandHandler}
 *
 * @param {Modeling} modeling
 * @param {SpaceTool} spaceTool
 */
export default function AddLaneHandler(modeling, spaceTool) {
  this._modeling = modeling;
  this._spaceTool = spaceTool;
}

AddLaneHandler.$inject = [
  'modeling',
  'spaceTool'
];


AddLaneHandler.prototype.preExecute = function(context) {

  var spaceTool = this._spaceTool,
      modeling = this._modeling;

  var shape = context.shape,
      location = context.location;

  var lanesRoot = getLanesRoot(shape);

  var isRoot = lanesRoot === shape,
      laneParent = isRoot ? shape : shape.parent;

  var existingChildLanes = getChildLanes(laneParent);

  var isHorizontalLane = isHorizontal(shape);

  // never mix up horizontal/vertical lanes
  if (isHorizontalLane) {
    if (location === 'left') {
      location = 'top';
    } else
    if (location === 'right') {
      location = 'bottom';
    }
  } else {
    if (location === 'top') {
      location = 'left';
    } else
    if (location === 'bottom') {
      location = 'right';
    }
  }

  // (0) add a lane if we currently got none and are adding to root
  if (!existingChildLanes.length) {
    var siblingPosition = isHorizontalLane ? {
      x: shape.x + LANE_INDENTATION,
      y: shape.y,
      width: shape.width - LANE_INDENTATION,
      height: shape.height
    } : {
      x: shape.x,
      y: shape.y + LANE_INDENTATION,
      width: shape.width,
      height: shape.height - LANE_INDENTATION
    };

    modeling.createShape(
      {
        type: 'bpmn:Lane',
        isHorizontal: isHorizontalLane
      },
      siblingPosition,
      laneParent
    );
  }

  // (1) collect affected elements to create necessary space
  var allAffected = [];

  eachElement(lanesRoot, function(element) {
    allAffected.push(element);

    // handle element labels in the diagram root
    if (element.label) {
      allAffected.push(element.label);
    }

    if (element === shape) {
      return [];
    }

    return filter(element.children, function(c) {
      return c !== shape;
    });
  });

  var offset,
      lanePosition,
      spacePos,
      direction,
      axis;

  if (location === 'top') {
    offset = -120;
    lanePosition = shape.y;
    spacePos = lanePosition + 10;
    direction = 'n';
    axis = 'y';
  } else
  if (location === 'left') {
    offset = -120;
    lanePosition = shape.x;
    spacePos = lanePosition + 10;
    direction = 'w';
    axis = 'x';
  } else
  if (location === 'bottom') {
    offset = 120;
    lanePosition = shape.y + shape.height;
    spacePos = lanePosition - 10;
    direction = 's';
    axis = 'y';
  } else
  if (location === 'right') {
    offset = 120;
    lanePosition = shape.x + shape.width;
    spacePos = lanePosition - 10;
    direction = 'e';
    axis = 'x';
  }

  var adjustments = spaceTool.calculateAdjustments(allAffected, axis, offset, spacePos);

  var delta = isHorizontalLane ? { x: 0, y: offset } : { x: offset, y: 0 };

  spaceTool.makeSpace(
    adjustments.movingShapes,
    adjustments.resizingShapes,
    delta,
    direction,
    spacePos
  );

  // (2) create new lane at open space
  var newLanePosition = isHorizontalLane ? {
    x: shape.x + (isRoot ? LANE_INDENTATION : 0),
    y: lanePosition - (location === 'top' ? 120 : 0),
    width: shape.width - (isRoot ? LANE_INDENTATION : 0),
    height: 120
  } : {
    x: lanePosition - (location === 'left' ? 120 : 0),
    y: shape.y + (isRoot ? LANE_INDENTATION : 0),
    width: 120,
    height: shape.height - (isRoot ? LANE_INDENTATION : 0)
  };

  context.newLane = modeling.createShape(
    {
      type: 'bpmn:Lane',
      isHorizontal: isHorizontalLane
    },
    newLanePosition,
    laneParent
  );
};
