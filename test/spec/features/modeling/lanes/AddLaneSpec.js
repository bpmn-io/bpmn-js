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

var DEFAULT_LANE_HEIGHT = 120,
    DEFAULT_VERTICAL_LANE_WIDTH = 120;

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

      expect(laneShape.di.isHorizontal).to.be.true;
      expect(belowLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
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

      expect(laneShape.di.isHorizontal).to.be.true;
      expect(aboveLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
    }));


    it('should add horizontal Lane after', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          belowLaneShape = elementRegistry.get('Lane_B');

      // when
      var newLane = modeling.addLane(laneShape, 'right');

      // then
      expect(laneShape.di.isHorizontal).to.be.true;
      expect(belowLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
    }));


    it('should add horizontal Lane before', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_B'),
          aboveLaneShape = elementRegistry.get('Lane_A');

      // when
      var newLane = modeling.addLane(laneShape, 'left');

      // then
      expect(laneShape.di.isHorizontal).to.be.true;
      expect(aboveLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
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

      expect(participantShape.di.isHorizontal).to.be.true;
      expect(laneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
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

      expect(participantShape.di.isHorizontal).to.be.true;
      expect(lastLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
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

      // first lane kept position
      expect(firstLaneShape).to.have.bounds(firstLaneBounds);

      // participant got enlarged by { dy: + LANE_HEIGHT } at bottom
      expect(participantShape).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y - DEFAULT_LANE_HEIGHT,
        width: participantBounds.width,
        height: participantBounds.height + DEFAULT_LANE_HEIGHT
      });

      expect(participantShape.di.isHorizontal).to.be.true;
      expect(firstLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
    }));

  });


  describe('nested vertical Lanes', function() {

    var diagramXML = require('./lanes.vertical.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add after Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane_A'),
          rightLaneShape = elementRegistry.get('Vertical_Lane_B');

      // when
      var newLane = modeling.addLane(laneShape, 'right');

      // then
      expect(newLane).to.have.bounds({
        x: laneShape.x + laneShape.width,
        y: laneShape.y,
        height: laneShape.height,
        width: DEFAULT_VERTICAL_LANE_WIDTH
      });

      // right lanes got moved by { dx: + DEFAULT_VERTICAL_LANE_WIDTH }
      expect(rightLaneShape).to.have.bounds({
        x: laneShape.x + laneShape.width + DEFAULT_VERTICAL_LANE_WIDTH,
        y: laneShape.y,
        width: rightLaneShape.width,
        height: laneShape.height
      });

      expect(laneShape.di.isHorizontal).to.be.false;
      expect(rightLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;

    }));


    it('should add before Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane_B'),
          leftLaneShape = elementRegistry.get('Vertical_Lane_A');

      // when
      var newLane = modeling.addLane(laneShape, 'left');

      // then
      expect(newLane).to.have.bounds({
        x: laneShape.x - DEFAULT_VERTICAL_LANE_WIDTH,
        y: laneShape.y,
        width: DEFAULT_VERTICAL_LANE_WIDTH,
        height: laneShape.height
      });

      // right lanes got moved by { dx: + DEFAULT_VERTICAL_LANE_WIDTH }
      expect(leftLaneShape).to.have.bounds({
        x: laneShape.x - leftLaneShape.width - DEFAULT_VERTICAL_LANE_WIDTH,
        y: laneShape.y,
        width: leftLaneShape.width,
        height: laneShape.height
      });

      expect(laneShape.di.isHorizontal).to.be.false;
      expect(leftLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;
    }));


    it('should add vertical Lane after', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane_A'),
          rightLaneShape = elementRegistry.get('Vertical_Lane_B');

      // when
      var newLane = modeling.addLane(laneShape, 'bottom');

      // then
      expect(laneShape.di.isHorizontal).to.be.false;
      expect(rightLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;

    }));


    it('should add vertical Lane before', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane_B'),
          leftLaneShape = elementRegistry.get('Vertical_Lane_A');

      // when
      var newLane = modeling.addLane(laneShape, 'top');

      // then
      expect(laneShape.di.isHorizontal).to.be.false;
      expect(leftLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;
    }));


    it('should add before nested Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Vertical_Lane_A'),
          participantShape = elementRegistry.get('Vertical_Participant_Lane'),
          participantBounds = getBounds(participantShape);

      // when
      var newLane = modeling.addLane(laneShape, 'left');

      // then
      expect(newLane).to.have.bounds({
        x: laneShape.x - DEFAULT_VERTICAL_LANE_WIDTH,
        y: laneShape.y,
        width: DEFAULT_VERTICAL_LANE_WIDTH,
        height: laneShape.height
      });

      // participant got enlarged { left: + DEFAULT_VERTICAL_LANE_WIDTH }
      expect(participantShape).to.have.bounds({
        x: participantBounds.x - newLane.width,
        y: participantBounds.y,
        width: participantBounds.width + newLane.width,
        height: participantBounds.height
      });

      expect(laneShape.di.isHorizontal).to.be.false;
      expect(participantShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;
    }));


    it('should add after Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_Lane'),
          participantBounds = getBounds(participantShape),
          lastLaneShape = elementRegistry.get('Vertical_Lane_B'),
          lastLaneBounds = getBounds(lastLaneShape);

      // when
      var newLane = modeling.addLane(participantShape, 'right');

      // then
      expect(newLane).to.have.bounds({
        x: participantBounds.x + participantBounds.width,
        y: participantBounds.y + 30,
        width: DEFAULT_VERTICAL_LANE_WIDTH,
        height: participantBounds.height - 30
      });

      // last lane kept position
      expect(lastLaneShape).to.have.bounds(lastLaneBounds);

      // participant got enlarged by { dx: + DEFAULT_VERTICAL_LANE_WIDTH } to the right
      expect(participantShape).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y,
        width: participantBounds.width + DEFAULT_VERTICAL_LANE_WIDTH,
        height: participantBounds.height
      });

      expect(participantShape.di.isHorizontal).to.be.false;
      expect(lastLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;

    }));


    it('should add before Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_Lane'),
          participantBounds = getBounds(participantShape),
          firstLaneShape = elementRegistry.get('Vertical_Lane_A'),
          firstLaneBounds = getBounds(firstLaneShape);

      // when
      var newLane = modeling.addLane(participantShape, 'left');

      // then
      expect(newLane).to.have.bounds({
        x: participantBounds.x - DEFAULT_VERTICAL_LANE_WIDTH,
        y: participantBounds.y + 30,
        width: DEFAULT_VERTICAL_LANE_WIDTH,
        height: participantBounds.height - 30
      });

      // first lane kept position
      expect(firstLaneShape).to.have.bounds(firstLaneBounds);

      // participant got enlarged by { dx: + DEFAULT_VERTICAL_LANE_WIDTH } to the left
      expect(participantShape).to.have.bounds({
        x: participantBounds.x - DEFAULT_VERTICAL_LANE_WIDTH,
        y: participantBounds.y,
        width: participantBounds.width + DEFAULT_VERTICAL_LANE_WIDTH,
        height: participantBounds.height
      });

      expect(participantShape.di.isHorizontal).to.be.false;
      expect(firstLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;

    }));

  });


  describe('without Participant', function() {

    var diagramXML = require('./lanes.only.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add horizontal Lane after', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          belowLaneShape = elementRegistry.get('Lane_B');

      // when
      var newLane = modeling.addLane(laneShape, 'right');

      // then
      expect(laneShape.di.isHorizontal).to.be.true;
      expect(belowLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
    }));


    it('should add horizontal Lane before', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_B'),
          aboveLaneShape = elementRegistry.get('Lane_A');

      // when
      var newLane = modeling.addLane(laneShape, 'left');

      // then
      expect(laneShape.di.isHorizontal).to.be.true;
      expect(aboveLaneShape.di.isHorizontal).to.be.true;
      expect(newLane.di.isHorizontal).to.be.true;
    }));

  });


  describe('vertical without Participant', function() {

    var diagramXML = require('./lanes.only.vertical.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add vertical Lane after', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane_A'),
          rightLaneShape = elementRegistry.get('Vertical_Lane_B');

      // when
      var newLane = modeling.addLane(laneShape, 'bottom');

      // then
      expect(laneShape.di.isHorizontal).to.be.false;
      expect(rightLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;

    }));


    it('should add vertical Lane before', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane_B'),
          leftLaneShape = elementRegistry.get('Vertical_Lane_A');

      // when
      var newLane = modeling.addLane(laneShape, 'top');

      // then
      expect(laneShape.di.isHorizontal).to.be.false;
      expect(leftLaneShape.di.isHorizontal).to.be.false;
      expect(newLane.di.isHorizontal).to.be.false;
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

      expect(firstLane.di.isHorizontal).to.be.true;
      expect(secondLane.di.isHorizontal).to.be.true;
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

      expect(firstLane.di.isHorizontal).to.be.true;
      expect(secondLane.di.isHorizontal).to.be.true;
    }));

  });


  describe('vertical Participant without Lane', function() {

    var diagramXML = require('./participant-no-lane-vertical.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add after Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_No_Lane'),
          participantBounds = getBounds(participantShape);

      // when
      modeling.addLane(participantShape, 'right');

      var childLanes = getChildLanes(participantShape);

      // then
      expect(childLanes.length).to.eql(2);

      var firstLane = childLanes[0],
          secondLane = childLanes[1];

      // new lane was added at participant location
      expect(firstLane).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y + 30,
        width: participantBounds.width,
        height: participantBounds.height - 30
      });

      expect(secondLane).to.have.bounds({
        x: participantBounds.x + participantBounds.width,
        y: participantBounds.y + 30,
        width: DEFAULT_VERTICAL_LANE_WIDTH,
        height: participantBounds.height - 30
      });

      expect(firstLane.di.isHorizontal).to.be.false;
      expect(secondLane.di.isHorizontal).to.be.false;
    }));


    it('should add before Participant', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_No_Lane'),
          participantBounds = getBounds(participantShape);

      // when
      modeling.addLane(participantShape, 'left');

      var childLanes = getChildLanes(participantShape);

      // then
      expect(childLanes.length).to.eql(2);

      var firstLane = childLanes[0],
          secondLane = childLanes[1];

      // new lane was added at participant location
      expect(firstLane).to.have.bounds({
        x: participantBounds.x,
        y: participantBounds.y + 30,
        width: participantBounds.width,
        height: participantBounds.height - 30
      });

      expect(secondLane).to.have.bounds({
        x: participantBounds.x - DEFAULT_VERTICAL_LANE_WIDTH,
        y: participantBounds.y + 30,
        width: DEFAULT_VERTICAL_LANE_WIDTH,
        height: participantBounds.height - 30
      });

      expect(firstLane.di.isHorizontal).to.be.false;
      expect(secondLane.di.isHorizontal).to.be.false;
    }));

  });


  describe('flow node handling - basics', function() {

    var diagramXML = require('./lanes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should move up flow nodes and sequence flows', inject(function(elementRegistry, modeling) {

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


  describe('flow node handling - basics vertical', function() {

    var diagramXML = require('./lanes.vertical.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should move left flow nodes and sequence flows', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Vertical_Lane_B'),
          task_Boundary = elementRegistry.get('V_Task_Boundary'),
          boundary = elementRegistry.get('V_Boundary'),
          sequenceFlow = elementRegistry.get('Flow_V'),
          sequenceFlow_From_Boundary = elementRegistry.get('Flow_From_V_Boundary');

      // when
      var newLane = modeling.addLane(laneShape, 'left');

      // then
      expect(task_Boundary).to.have.position({ x: 190 - newLane.width, y: 170 });
      expect(boundary).to.have.position({ x: 272 - newLane.width, y: 212 });

      expect(sequenceFlow_From_Boundary).to.have.waypoints([
        { x: 308 - newLane.width, y: 230 },
        { x: 320 - newLane.width, y: 230 },
        { x: 320 - newLane.width, y: 370 },
        { x: 290 - newLane.width, y: 370 }
      ]);

      expect(sequenceFlow).to.have.waypoints([
        { x: 240 - newLane.width, y: 250 },
        { x: 240 - newLane.width, y: 330 }
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
          labelPosition = getPosition(label),
          boundary = elementRegistry.get('Boundary'),
          boundaryLabel = boundary.label,
          boundaryLabelPosition = getPosition(boundaryLabel);

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

      expect(boundaryLabel).to.have.position({
        x: boundaryLabelPosition.x,
        y: boundaryLabelPosition.y - 120
      });
    }));

  });

  describe('flow node handling - vertical', function() {

    var diagramXML = require('./lanes-flow-nodes-vertical.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    function addLaneLeft(laneId) {

      return getBpmnJS().invoke(function(elementRegistry, modeling) {
        var existingLane = elementRegistry.get(laneId);

        expect(existingLane).to.exist;

        return modeling.addLane(existingLane, 'left');
      });
    }

    function addLaneRight(laneId) {

      return getBpmnJS().invoke(function(elementRegistry, modeling) {
        var existingLane = elementRegistry.get(laneId);

        expect(existingLane).to.exist;

        return modeling.addLane(existingLane, 'right');
      });
    }

    it('should move flow nodes', inject(function(elementRegistry, modeling) {

      // given
      var task_Boundary = elementRegistry.get('V_Task_Boundary'),
          taskPosition = getPosition(task_Boundary),
          boundary = elementRegistry.get('V_Boundary'),
          boundaryPosition = getPosition(boundary);

      // when
      addLaneLeft('Nested_Vertical_Lane_B');

      // then
      expect(task_Boundary).to.have.position({ x: taskPosition.x - 120, y: taskPosition.y });
      expect(boundary).to.have.position({ x: boundaryPosition.x - 120, y: boundaryPosition.y });
    }));


    it('should move sequence flows', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('Flow_V'),
          sequenceFlowWaypoints = sequenceFlow.waypoints,
          sequenceFlow_From_Boundary = elementRegistry.get('Flow_From_V_Boundary'),
          sequenceFlow_From_BoundaryWaypoints = sequenceFlow_From_Boundary.waypoints;

      // when
      addLaneLeft('Nested_Vertical_Lane_B');

      // then
      expect(sequenceFlow_From_Boundary).to.have.waypoints(
        moveWaypoints(sequenceFlow_From_BoundaryWaypoints, -120, 0)
      );

      expect(sequenceFlow).to.have.waypoints(
        moveWaypoints(sequenceFlowWaypoints, -120, 0)
      );
    }));


    it('should move message flows when lane added above', inject(function(elementRegistry) {

      // given
      var messageFlow = elementRegistry.get('MessageFlowLeft'),
          messageFlowWaypoints = messageFlow.waypoints;

      // when
      addLaneLeft('Nested_Vertical_Lane_B');

      // then
      expect(messageFlow).to.have.waypoints([
        movePosition(messageFlowWaypoints[0], -120, 0),
        messageFlowWaypoints[1]
      ]);
    }));


    it('should move message flows when lane added below', inject(function(elementRegistry) {

      // given
      var messageFlow = elementRegistry.get('MessageFlowRight'),
          messageFlowWaypoints = messageFlow.waypoints;

      // when
      addLaneRight('Nested_Vertical_Lane_B');

      // then
      expect(messageFlow).to.have.waypoints([
        messageFlowWaypoints[0],
        movePosition(messageFlowWaypoints[1], 120, 0)
      ]);
    }));


    it('should move external labels', inject(function(elementRegistry, modeling) {

      // given
      var event = elementRegistry.get('V_Event'),
          label = event.label,
          labelPosition = getPosition(label),
          boundary = elementRegistry.get('V_Boundary'),
          boundaryLabel = boundary.label,
          boundaryLabelPosition = getPosition(boundaryLabel);

      // TODO(nikku): consolidate import + editing behavior => not consistent right now

      // when
      // force move label to trigger label editing + update parent behavior
      modeling.moveElements([ label ], { x: 0, y: 0 });

      addLaneLeft('Nested_Vertical_Lane_B');

      // then
      expect(label).to.have.position({
        x: labelPosition.x - 120,
        y: labelPosition.y
      });

      expect(boundaryLabel).to.have.position({
        x: boundaryLabelPosition.x - 120,
        y: boundaryLabelPosition.y
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
