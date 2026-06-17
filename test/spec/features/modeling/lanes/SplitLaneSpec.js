import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import { pick } from 'min-dash';

import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';
import { getChildLanes } from 'bpmn-js/lib/features/modeling/util/LaneUtil.js';

import participantLaneXML from './participant-lane.bpmn';
import participantLaneVerticalXML from './participant-lane-vertical.bpmn';
import participantNoLaneXML from './participant-no-lane.bpmn';
import participantNoLaneVerticalXML from './participant-no-lane-vertical.bpmn';
import nestedXML from './SplitLane.nested.bpmn';
import nestedVerticalXML from './SplitLane.nested.vertical.bpmn';


function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height' ]);
}

var testModules = [
  coreModule,
  modelingModule
];


describe('features/modeling - SplitLane', function() {

  describe('should split Participant with Lane', function() {

    beforeEach(bootstrapModeler(participantLaneXML, { modules: testModules }));


    it('into two lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_Lane'),
          existingLane = elementRegistry.get('Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 2);

      var childLanes = getChildLanes(participantShape);

      var newLaneHeight = Math.round(participantShape.height / 2);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes.length).to.eql(2);

      // with the first lane being the original one
      expect(childLanes[0]).to.equal(existingLane);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y + newLaneHeight,
        width: participantShape.width - 30,
        height: newLaneHeight - 1 // compensate for rounding issues
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.true;
      expect(childLanes[1].di.isHorizontal).to.be.true;
    }));


    it('into three lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_Lane'),
          existingLane = elementRegistry.get('Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 3);

      var childLanes = getChildLanes(participantShape);

      var newLaneHeight = Math.round(participantShape.height / 3);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes.length).to.eql(3);

      // with the first lane being the original one
      expect(childLanes[0]).to.equal(existingLane);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y + newLaneHeight,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[2]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y + newLaneHeight * 2,
        width: participantShape.width - 30,
        height: newLaneHeight - 1 // compensate for rounding issues
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.true;
      expect(childLanes[1].di.isHorizontal).to.be.true;
      expect(childLanes[2].di.isHorizontal).to.be.true;
    }));

  });


  describe('should split vertical Participant with Lane', function() {

    beforeEach(bootstrapModeler(participantLaneVerticalXML, { modules: testModules }));


    it('into two lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_Lane'),
          existingLane = elementRegistry.get('Vertical_Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 2);

      var childLanes = getChildLanes(participantShape);

      var newLaneWidth = Math.round(participantShape.width / 2);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes.length).to.eql(2);

      // with the first lane being the original one
      expect(childLanes[0]).to.equal(existingLane);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + newLaneWidth,
        y: participantShape.y + 30,
        width: newLaneWidth - 1, // compensate for rounding issues
        height: participantShape.height - 30
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.false;
      expect(childLanes[1].di.isHorizontal).to.be.false;
    }));


    it('into three lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_Lane'),
          existingLane = elementRegistry.get('Vertical_Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 3);

      var childLanes = getChildLanes(participantShape);

      var newLaneWidth = Math.round(participantShape.width / 3);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and three child lanes
      expect(childLanes.length).to.eql(3);

      // with the first lane being the original one
      expect(childLanes[0]).to.equal(existingLane);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + newLaneWidth,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      expect(childLanes[2]).to.have.bounds({
        x: participantShape.x + newLaneWidth * 2,
        y: participantShape.y + 30,
        width: newLaneWidth - 1, // compensate for rounding issues
        height: participantShape.height - 30
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.false;
      expect(childLanes[1].di.isHorizontal).to.be.false;
      expect(childLanes[2].di.isHorizontal).to.be.false;
    }));

  });


  describe('should split Participant without Lane', function() {

    beforeEach(bootstrapModeler(participantNoLaneXML, { modules: testModules }));


    it('into two lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_No_Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 2);

      var childLanes = getChildLanes(participantShape);

      var newLaneHeight = Math.round(participantShape.height / 2);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes).to.have.length(2);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y + newLaneHeight,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.true;
      expect(childLanes[1].di.isHorizontal).to.be.true;
    }));


    it('into three lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_No_Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 3);

      var childLanes = getChildLanes(participantShape);

      var newLaneHeight = Math.round(participantShape.height / 3);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes).to.have.length(3);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y + newLaneHeight,
        width: participantShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[2]).to.have.bounds({
        x: participantShape.x + 30,
        y: participantShape.y + newLaneHeight * 2,
        width: participantShape.width - 30,
        height: newLaneHeight + 1 // compensate for rounding issues
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.true;
      expect(childLanes[1].di.isHorizontal).to.be.true;
      expect(childLanes[2].di.isHorizontal).to.be.true;
    }));

  });


  describe('should split vertical Participant without Lane', function() {

    beforeEach(bootstrapModeler(participantNoLaneVerticalXML, {
      modules: testModules
    }));


    it('into two lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_No_Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 2);

      var childLanes = getChildLanes(participantShape);

      var newLaneWidth = Math.round(participantShape.width / 2);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes).to.have.length(2);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + newLaneWidth,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.false;
      expect(childLanes[1].di.isHorizontal).to.be.false;
    }));


    it('into three lanes', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Vertical_Participant_No_Lane'),
          oldBounds = getBounds(participantShape);

      // when
      modeling.splitLane(participantShape, 3);

      var childLanes = getChildLanes(participantShape);

      var newLaneWidth = Math.round(participantShape.width / 3);

      // then

      // participant has original size
      expect(participantShape).to.have.bounds(oldBounds);

      // and three child lanes
      expect(childLanes).to.have.length(3);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: participantShape.x,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      expect(childLanes[1]).to.have.bounds({
        x: participantShape.x + newLaneWidth,
        y: participantShape.y + 30,
        width: newLaneWidth,
        height: participantShape.height - 30
      });

      expect(childLanes[2]).to.have.bounds({
        x: participantShape.x + newLaneWidth * 2,
        y: participantShape.y + 30,
        width: newLaneWidth + 1, // compensate for rounding issues
        height: participantShape.height - 30
      });

      // with participant's direction
      expect(childLanes[0].di.isHorizontal).to.be.false;
      expect(childLanes[1].di.isHorizontal).to.be.false;
      expect(childLanes[2].di.isHorizontal).to.be.false;
    }));

  });


  describe('should split nested Lane', function() {

    beforeEach(bootstrapModeler(nestedXML, { modules: testModules }));


    it('into two lanes', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane'),
          laneBo = laneShape.businessObject,
          oldBounds = getBounds(laneShape);

      // when
      modeling.splitLane(laneShape, 2);

      var childLanes = getChildLanes(laneShape);

      var newLaneHeight = Math.round(laneShape.height / 2);

      // then

      // participant has original size
      expect(laneShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes).to.have.length(2);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: laneShape.x + 30,
        y: laneShape.y,
        width: laneShape.width - 30,
        height: newLaneHeight
      });

      expect(childLanes[1]).to.have.bounds({
        x: laneShape.x + 30,
        y: laneShape.y + newLaneHeight,
        width: laneShape.width - 30,
        height: newLaneHeight
      });

      // BPMN internals are properly updated
      expect(laneBo.childLaneSet).to.exist;
      expect(laneBo.childLaneSet.lanes).to.eql([
        childLanes[0].businessObject,
        childLanes[1].businessObject
      ]);

      // with parent lane's direction
      expect(childLanes[0].di.isHorizontal).to.be.true;
      expect(childLanes[1].di.isHorizontal).to.be.true;

    }));

  });


  describe('should split nested vertical Lane', function() {

    beforeEach(bootstrapModeler(nestedVerticalXML, { modules: testModules }));


    it('into two lanes', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Vertical_Lane'),
          laneBo = laneShape.businessObject,
          oldBounds = getBounds(laneShape);

      // when
      modeling.splitLane(laneShape, 2);

      var childLanes = getChildLanes(laneShape);

      var newLaneWidth = Math.round(laneShape.width / 2);

      // then

      // participant has original size
      expect(laneShape).to.have.bounds(oldBounds);

      // and two child lanes
      expect(childLanes).to.have.length(2);

      // with respective bounds
      expect(childLanes[0]).to.have.bounds({
        x: laneShape.x,
        y: laneShape.y + 30,
        width: newLaneWidth,
        height: laneShape.height - 30
      });

      expect(childLanes[1]).to.have.bounds({
        x: laneShape.x + newLaneWidth,
        y: laneShape.y + 30,
        width: newLaneWidth,
        height: laneShape.height - 30
      });

      // BPMN internals are properly updated
      expect(laneBo.childLaneSet).to.exist;
      expect(laneBo.childLaneSet.lanes).to.eql([
        childLanes[0].businessObject,
        childLanes[1].businessObject
      ]);

      // with parent lane's direction
      expect(childLanes[0].di.isHorizontal).to.be.false;
      expect(childLanes[1].di.isHorizontal).to.be.false;
    }));

  });

});