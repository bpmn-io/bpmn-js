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

  // (0) add a lane if we currently got none and are adding to root
  if (!existingChildLanes.length) {
    modeling.createShape({ type: 'bpmn:Lane' }, {
      x: shape.x + LANE_INDENTATION,
      y: shape.y,
      width: shape.width - LANE_INDENTATION,
      height: shape.height
    }, laneParent);
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

  var offset = location === 'top' ? -120 : 120,
      lanePosition = location === 'top' ? shape.y : shape.y + shape.height,
      spacePos = lanePosition + (location === 'top' ? 10 : -10),
      direction = location === 'top' ? 'n' : 's';

  var adjustments = spaceTool.calculateAdjustments(allAffected, 'y', offset, spacePos);

  spaceTool.makeSpace(
    adjustments.movingShapes,
    adjustments.resizingShapes,
    { x: 0, y: offset },
    direction,
    spacePos
  );

  // (2) create new lane at open space
  context.newLane = modeling.createShape({ type: 'bpmn:Lane' }, {
    x: shape.x + (isRoot ? LANE_INDENTATION : 0),
    y: lanePosition - (location === 'top' ? 120 : 0),
    width: shape.width - (isRoot ? LANE_INDENTATION : 0),
    height: 120
  }, laneParent);
};
