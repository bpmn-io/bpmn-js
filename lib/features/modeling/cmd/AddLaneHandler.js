'use strict';

var filter = require('lodash/collection/filter');

var Elements = require('diagram-js/lib/util/Elements');

var getLanesRoot = require('../util/LaneUtil').getLanesRoot,
    getChildLanes = require('../util/LaneUtil').getChildLanes,
    LANE_INDENTATION = require('../util/LaneUtil').LANE_INDENTATION;

/**
 * A handler that allows us to add a new lane
 * above or below an existing one.
 *
 * @param {Modeling} modeling
 */
function AddLaneHandler(modeling, spaceTool) {
  this._modeling = modeling;
  this._spaceTool = spaceTool;
}

AddLaneHandler.$inject = [ 'modeling', 'spaceTool' ];

module.exports = AddLaneHandler;


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

  Elements.eachElement(lanesRoot, function(element) {
    allAffected.push(element);

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

  spaceTool.makeSpace(adjustments.movingShapes, adjustments.resizingShapes, { x: 0, y: offset }, direction);

  // (2) create new lane at open space
  context.newLane = modeling.createShape({ type: 'bpmn:Lane' }, {
    x: shape.x + (isRoot ? LANE_INDENTATION : 0),
    y: lanePosition - (location === 'top' ? 120 : 0),
    width: shape.width - (isRoot ? LANE_INDENTATION : 0),
    height: 120
  }, laneParent);
};
