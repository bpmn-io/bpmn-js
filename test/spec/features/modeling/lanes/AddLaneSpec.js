import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  map,
  pick
} from 'min-dash';

import contextPadModule from 'lib/features/context-pad';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  getChildLanes
} from 'lib/features/modeling/util/LaneUtil';

import { query as domQuery } from 'min-dom';

var DEFAULT_LANE_HEIGHT = 120;

var testModules = [ coreModule, modelingModule ];


function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/modeling - add Lane', function() {

  describe('nested Lanes', function() {

    var diagramXML = require('./lanes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add after Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          belowLaneShape = elementRegistry.get('Lane_B');

      // when
      var newLane = modeling.addLane(laneShape, 'bottom');

      // then
      expect(newLane).to.have.bounds({
        x: laneShape.x,
        y: laneShape.y + laneShape.height,
        width: laneShape.width,
        height: DEFAULT_LANE_HEIGHT
      });

      // below lanes got moved by { dy: + LANE_HEIGHT }
      expect(belowLaneShape).to.have.bounds({
        x: laneShape.x,
        y: laneShape.y + laneShape.height + DEFAULT_LANE_HEIGHT - 1,
        width: laneShape.width,
        height: belowLaneShape.height
      });

    }));


    it('should add before Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_B'),
          aboveLaneShape = elementRegistry.get('Lane_A');

      // when
      var newLane = modeling.addLane(laneShape, 'top');

      // then
      expect(newLane).to.have.bounds({
        x: laneShape.x,
        y: laneShape.y - DEFAULT_LANE_HEIGHT,
        width: laneShape.width,
        height: DEFAULT_LANE_HEIGHT
      });

      // below lanes got moved by { dy: + LANE_HEIGHT }
      expect(aboveLaneShape).to.have.bounds({
        x: laneShape.x,
        y: laneShape.y - aboveLaneShape.height - DEFAULT_LANE_HEIGHT + 1,
        width: laneShape.width,
        height: aboveLaneShape.height
      });
    }));


    it('should add before nested Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Lane_A'),
          participantShape = elementRegistry.get('Participant_Lane'),
          participantBounds = getBounds(participantShape);

      // when
      var newLane = modeling.addLane(laneShape, 'top');

      // then
      expect(newLane).to.have.bounds({
        x: laneShape.x,
        y: laneShape.y - DEFAULT_LANE_HEIGHT,
        width: laneShape.width,
        height: DEFAULT_LANE_HEIGHT
      });

      // participant got enlarged { top: + LANE_HEIGHT }
      expect(participantShape).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y - newLane.height,
        width: participantBounds.width,
        height: participantBounds.height + newLane.height
      });
    }));


    it('should add after Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_Lane'),
          participantBounds = getBounds(participantShape),
          lastLaneShape = elementRegistry.get('Lane_B'),
          lastLaneBounds = getBounds(lastLaneShape);

      // when
      var newLane = modeling.addLane(participantShape, 'bottom');

      // then
      expect(newLane).to.have.bounds({
        x: participantBounds.x + 30,
        y: participantBounds.y + participantBounds.height,
        width: participantBounds.width - 30,
        height: DEFAULT_LANE_HEIGHT
      });

      // last lane kept position
      expect(lastLaneShape).to.have.bounds(lastLaneBounds);

      // participant got enlarged by { dy: + LANE_HEIGHT } at bottom
      expect(participantShape).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y,
        width: participantBounds.width,
        height: participantBounds.height + DEFAULT_LANE_HEIGHT
      });

    }));


    it('should add before Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_Lane'),
          participantBounds = getBounds(participantShape),
          firstLaneShape = elementRegistry.get('Lane_A'),
          firstLaneBounds = getBounds(firstLaneShape);

      // when
      var newLane = modeling.addLane(participantShape, 'top');

      // then
      expect(newLane).to.have.bounds({
        x: participantBounds.x + 30,
        y: participantBounds.y - DEFAULT_LANE_HEIGHT,
        width: participantBounds.width - 30,
        height: DEFAULT_LANE_HEIGHT
      });

      // last lane kept position
      expect(firstLaneShape).to.have.bounds(firstLaneBounds);

      // participant got enlarged by { dy: + LANE_HEIGHT } at bottom
      expect(participantShape).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y - DEFAULT_LANE_HEIGHT,
        width: participantBounds.width,
        height: participantBounds.height + DEFAULT_LANE_HEIGHT
      });

    }));

  });


  describe('Participant without Lane', function() {

    var diagramXML = require('./participant-no-lane.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add after Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_No_Lane'),
          participantBounds = getBounds(participantShape);

      // when
      modeling.addLane(participantShape, 'bottom');

      var childLanes = getChildLanes(participantShape);

      // then
      expect(childLanes.length).to.eql(2);

      var firstLane = childLanes[0],
          secondLane = childLanes[1];

      // new lane was added at participant location
      expect(firstLane).to.have.bounds({
        x: participantBounds.x + 30,
        y: participantBounds.y,
        width: participantBounds.width - 30,
        height: participantBounds.height
      });

      expect(secondLane).to.have.bounds({
        x: participantBounds.x + 30,
        y: participantBounds.y + participantBounds.height,
        width: participantBounds.width - 30,
        height: DEFAULT_LANE_HEIGHT
      });
    }));


    it('should add before Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_No_Lane'),
          participantBounds = getBounds(participantShape);

      // when
      modeling.addLane(participantShape, 'top');

      var childLanes = getChildLanes(participantShape);

      // then
      expect(childLanes.length).to.eql(2);

      var firstLane = childLanes[0],
          secondLane = childLanes[1];

      // new lane was added at participant location
      expect(firstLane).to.have.bounds({
        x: participantBounds.x + 30,
        y: participantBounds.y,
        width: participantBounds.width - 30,
        height: participantBounds.height
      });

      expect(secondLane).to.have.bounds({
        x: participantBounds.x + 30,
        y: participantBounds.y - DEFAULT_LANE_HEIGHT,
        width: participantBounds.width - 30,
        height: DEFAULT_LANE_HEIGHT
      });

    }));

  });


  describe('flow node handling', function() {

    var diagramXML = require('./lanes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should move flow nodes and sequence flows', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Lane_B'),
          task_Boundary = elementRegistry.get('Task_Boundary'),
          boundary = elementRegistry.get('Boundary'),
          sequenceFlow = elementRegistry.get('SequenceFlow'),
          sequenceFlow_From_Boundary = elementRegistry.get('SequenceFlow_From_Boundary');

      // when
      var newLane = modeling.addLane(laneShape, 'top');

      // then
      expect(task_Boundary).to.have.position({ x: 264, y: -57 });
      expect(boundary).to.have.position({ x: 311, y: 5 });

      expect(sequenceFlow_From_Boundary).to.have.waypoints([
        { x: 329, y: 161 - newLane.height },
        { x: 329, y: 188 - newLane.height },
        { x: 482, y: 188 - newLane.height },
        { x: 482, y: 143 - newLane.height }
      ]);

      expect(sequenceFlow).to.have.waypoints([
        { x: 364, y: 103 - newLane.height },
        { x: 432, y: 103 - newLane.height }
      ]);
    }));
  });

  describe('flow node handling', function() {

    var diagramXML = require('./lanes-flow-nodes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    function addLaneAbove(laneId) {

      return getBpmnJS().invoke(function(elementRegistry, modeling) {
        var existingLane = elementRegistry.get(laneId);

        expect(existingLane).to.exist;

        return modeling.addLane(existingLane, 'top');
      });
    }

    function addLaneBelow(laneId) {

      return getBpmnJS().invoke(function(elementRegistry, modeling) {
        var existingLane = elementRegistry.get(laneId);

        expect(existingLane).to.exist;

        return modeling.addLane(existingLane, 'bottom');
      });
    }


    it('should move flow nodes', inject(function(elementRegistry, modeling) {

      // given
      var task_Boundary = elementRegistry.get('Task_Boundary'),
          taskPosition = getPosition(task_Boundary),
          boundary = elementRegistry.get('Boundary'),
          boundaryPosition = getPosition(boundary);

      // when
      addLaneAbove('Nested_Lane_B');

      // then
      expect(task_Boundary).to.have.position({ x: taskPosition.x, y: taskPosition.y - 120 });
      expect(boundary).to.have.position({ x: boundaryPosition.x, y: boundaryPosition.y - 120 });
    }));


    it('should move sequence flows', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow'),
          sequenceFlowWaypoints = sequenceFlow.waypoints,
          sequenceFlow_From_Boundary = elementRegistry.get('SequenceFlow_From_Boundary'),
          sequenceFlow_From_BoundaryWaypoints = sequenceFlow_From_Boundary.waypoints;

      // when
      addLaneAbove('Nested_Lane_B');

      // then
      expect(sequenceFlow_From_Boundary).to.have.waypoints(
        moveWaypoints(sequenceFlow_From_BoundaryWaypoints, 0, -120)
      );

      expect(sequenceFlow).to.have.waypoints(
        moveWaypoints(sequenceFlowWaypoints, 0, -120)
      );
    }));


    it('should move message flows when lane added above', inject(function(elementRegistry) {

      // given
      var messageFlow = elementRegistry.get('MessageFlowAbove'),
          messageFlowWaypoints = messageFlow.waypoints;

      // when
      addLaneAbove('Nested_Lane_B');

      // then
      expect(messageFlow).to.have.waypoints([
        movePosition(messageFlowWaypoints[0], 0, -120),
        messageFlowWaypoints[1]
      ]);
    }));


    it('should move message flows when lane added below', inject(function(elementRegistry) {

      // given
      var messageFlow = elementRegistry.get('MessageFlowBelow'),
          messageFlowWaypoints = messageFlow.waypoints;

      // when
      addLaneBelow('Nested_Lane_B');

      // then
      expect(messageFlow).to.have.waypoints([
        messageFlowWaypoints[0],
        movePosition(messageFlowWaypoints[1], 0, 120)
      ]);
    }));


    it('should move external labels', inject(function(elementRegistry, modeling) {

      // given
      var event = elementRegistry.get('Event'),
          label = event.label,
          labelPosition = getPosition(label);

      // TODO(nikku): consolidate import + editing behavior => not consistent right now

      // when
      // force move label to trigger label editing + update parent behavior
      modeling.moveElements([ label ], { x: 0, y: 0 });

      addLaneAbove('Nested_Lane_B');

      // then
      expect(label).to.have.position({
        x: labelPosition.x,
        y: labelPosition.y - 120
      });
    }));

  });


  describe('Internet Explorer', function() {

    var diagramXML = require('./participant-single-lane.bpmn');

    var testModules = [
      contextPadModule,
      coreModule,
      modelingModule
    ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    // must be executed manually, cannot be reproduced programmatically
    // https://github.com/bpmn-io/bpmn-js/issues/746
    it('should NOT blow up in Internet Explorer', inject(
      function(contextPad, elementRegistry) {

        // given
        var lane = elementRegistry.get('Lane_1');

        contextPad.open(lane);

        // mock event
        var event = padEvent('lane-insert-below');

        // when
        contextPad.trigger('click', event);

        // then
        // expect Internet Explorer NOT to blow up
      }
    ));

  });

});

// helpers //////////

function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}

function padEvent(entry) {

  return getBpmnJS().invoke(function(overlays) {

    var target = padEntry(overlays._overlayRoot, entry);

    return {
      target: target,
      preventDefault: function() {},
      clientX: 100,
      clientY: 100
    };
  });
}

function getPosition(element) {
  return {
    x: element.x,
    y: element.y
  };
}

function moveWaypoints(waypoints, deltaX, deltaY) {
  return map(waypoints, function(waypoint) {
    return movePosition(waypoint, deltaX, deltaY);
  });
}

function movePosition(point, deltaX, deltaY) {
  return {
    x: point.x + deltaX,
    y: point.y + deltaY
  };
}
