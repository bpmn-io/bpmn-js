'use strict';

var collectLanes = require('../util/LaneUtil').collectLanes;

var getLanesRoot = require('../util/LaneUtil').getLanesRoot;

var is = require('../../../util/ModelUtil').is;

var Collections = require('diagram-js/lib/util/Collections');

var asTRBL = require('diagram-js/lib/layout/LayoutUtil').asTRBL;

var FLOW_NODE_REFS_ATTR = 'flowNodeRef',
    LANES_ATTR = 'lanes';

/**
 * A handler that updates lane refs on changed elements
 */
function UpdateFlowNodeRefsHandler(elementRegistry) {
  this._elementRegistry = elementRegistry;
}

UpdateFlowNodeRefsHandler.$inject = [ 'elementRegistry' ];

module.exports = UpdateFlowNodeRefsHandler;


UpdateFlowNodeRefsHandler.prototype.computeUpdates = function(flowNodeShapes, laneShapes) {

  var handledNodes = {};

  var updates = [];

  var participantCache = {};

  var allFlowNodeShapes = [];

  function isInLaneShape(element, laneShape) {

    var laneTrbl = asTRBL(laneShape);

    var elementMid = {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2
    };

    return elementMid.x > laneTrbl.left &&
           elementMid.x < laneTrbl.right &&
           elementMid.y > laneTrbl.top &&
           elementMid.y < laneTrbl.bottom;
  }

  function addFlowNodeShape(flowNodeShape) {
    if (!handledNodes[flowNodeShape.id]) {
      allFlowNodeShapes.push(flowNodeShape);
      handledNodes[flowNodeShape.id] = flowNodeShape;
    }
  }

  function getAllLaneShapes(flowNodeShape) {

    var root = getLanesRoot(flowNodeShape);

    if (!participantCache[root.id]) {
      participantCache[root.id] = collectLanes(root);
    }

    return participantCache[root.id];
  }

  function getNewLanes(flowNodeShape) {
    if (!flowNodeShape.parent) {
      return [];
    }

    var allLaneShapes = getAllLaneShapes(flowNodeShape);

    return allLaneShapes.filter(function(l) {
      return isInLaneShape(flowNodeShape, l);
    }).map(function(shape) {
      return shape.businessObject;
    });
  }

  laneShapes.forEach(function(laneShape) {
    var root = getLanesRoot(laneShape);

    if (!root || handledNodes[root.id]) {
      return;
    }

    var children = root.children.filter(function(c) {
      return is(c, 'bpmn:FlowNode');
    });

    children.forEach(addFlowNodeShape);

    handledNodes[root.id] = root;
  });

  flowNodeShapes.forEach(addFlowNodeShape);


  allFlowNodeShapes.forEach(function(flowNodeShape) {

    var flowNode = flowNodeShape.businessObject;

    var lanes = flowNode.get(LANES_ATTR),
        remove = lanes.slice(),
        add = getNewLanes(flowNodeShape);

    updates.push({ flowNode: flowNode, remove: remove, add: add });
  });

  laneShapes.forEach(function(laneShape) {

    var lane = laneShape.businessObject;

    // lane got removed XX-)
    if (!laneShape.parent) {
      lane.get(FLOW_NODE_REFS_ATTR).forEach(function(flowNode) {
        updates.push({ flowNode: flowNode, remove: [ lane ], add: [] });
      });
    }
  });

  return updates;
};

UpdateFlowNodeRefsHandler.prototype.execute = function(context) {

  var updates = context.updates;

  if (!updates) {
    updates = context.updates = this.computeUpdates(context.flowNodeShapes, context.laneShapes);
  }


  updates.forEach(function(update) {

    var flowNode = update.flowNode,
        lanes = flowNode.get(LANES_ATTR);

    // unwire old
    update.remove.forEach(function(oldLane) {
      Collections.remove(lanes, oldLane);
      Collections.remove(oldLane.get(FLOW_NODE_REFS_ATTR), flowNode);
    });

    // wire new
    update.add.forEach(function(newLane) {
      Collections.add(lanes, newLane);
      Collections.add(newLane.get(FLOW_NODE_REFS_ATTR), flowNode);
    });
  });

  // TODO(nikku): return changed elements
  // return [ ... ];
};


UpdateFlowNodeRefsHandler.prototype.revert = function(context) {

  var updates = context.updates;

  updates.forEach(function(update) {

    var flowNode = update.flowNode,
        lanes = flowNode.get(LANES_ATTR);

    // unwire new
    update.add.forEach(function(newLane) {
      Collections.remove(lanes, newLane);
      Collections.remove(newLane.get(FLOW_NODE_REFS_ATTR), flowNode);
    });

    // wire old
    update.remove.forEach(function(oldLane) {
      Collections.add(lanes, oldLane);
      Collections.add(oldLane.get(FLOW_NODE_REFS_ATTR), flowNode);
    });
  });

  // TODO(nikku): return changed elements
  // return [ ... ];
};