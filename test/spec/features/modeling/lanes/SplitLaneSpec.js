'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('lodash/object/pick');

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var getChildLanes = require('lib/features/modeling/util/LaneUtil').getChildLanes;


function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/modeling - SplitLane', function() {

  describe('should split Participant with Lane', function() {

    var diagramXML = require('./participant-lane.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


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
    }));

  });


  describe('should split Participant without Lane', function() {

    var diagramXML = require('./participant-no-lane.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


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
      expect(childLanes.length).to.eql(2);

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
      expect(childLanes.length).to.eql(3);

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
    }));

  });

});