import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import {
  resizeTRBL
} from 'diagram-js/lib/features/resize/ResizeUtil';

import {
  pick
} from 'min-dash';

function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height']);
}


describe('features/modeling - resize lane', function() {

  var diagramXML = require('./lanes.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('vertical', function() {

    describe('compensating', function() {

      it('should expand Lane top', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { top: -50 });

        var expectedParticipantBounds = resizeTRBL(participantShape, { top: -50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds, false);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
      }));


      it('should shrink Lane top', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { top: 50 });

        var expectedParticipantBounds = resizeTRBL(participantShape, { top: 50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds, false);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
      }));


      it('should shrink Participant top', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newParticipantBounds = resizeTRBL(participantShape, { top: 50 });

        var expectedLaneBounds = resizeTRBL(laneShape, { top: 50 });

        // when
        modeling.resizeLane(participantShape, newParticipantBounds, false);

        // then
        expect(participantShape).to.have.bounds(newParticipantBounds);
        expect(laneShape).to.have.bounds(expectedLaneBounds);
      }));


      it('should shrink Lane bottom', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            nextLaneShape = elementRegistry.get('Lane_B'),
            nestedLaneShape = elementRegistry.get('Nested_Lane_C'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { bottom: -50 });

        var expectedParticipantBounds = resizeTRBL(participantShape, { bottom: -50 }),
            expectedNextLaneBounds = resizeTRBL(nextLaneShape, { top: -50, bottom: -50 }),
            expectedNestedLaneBounds = resizeTRBL(nestedLaneShape, { bottom: -50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds, false);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
        expect(nestedLaneShape).to.have.bounds(expectedNestedLaneBounds);
        expect(nextLaneShape).to.have.bounds(expectedNextLaneBounds);
      }));


      it('should expand Lane bottom', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            nextLaneShape = elementRegistry.get('Lane_B'),
            nestedLaneShape = elementRegistry.get('Nested_Lane_C'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { bottom: 50 });

        var expectedParticipantBounds = resizeTRBL(participantShape, { bottom: 50 }),
            expectedNextLaneBounds = resizeTRBL(nextLaneShape, { top: 50, bottom: 50 }),
            expectedNestedLaneBounds = resizeTRBL(nestedLaneShape, { bottom: 50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds, false);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
        expect(nestedLaneShape).to.have.bounds(expectedNestedLaneBounds);
        expect(nextLaneShape).to.have.bounds(expectedNextLaneBounds);
      }));

    });


    describe('enlarging / shrinking', function() {

      it('should expand Lane top', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { top: -50 });

        var expectedParticipantBounds = resizeTRBL(participantShape, { top: -50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
      }));


      it('should shrink Lane top', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { top: 50 });

        var expectedParticipantBounds = resizeTRBL(participantShape, { top: 50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
      }));


      it('should shrink Participant top', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newParticipantBounds = resizeTRBL(participantShape, { top: 50 });

        var expectedLaneBounds = resizeTRBL(laneShape, { top: 50 });

        // when
        modeling.resizeLane(participantShape, newParticipantBounds);

        // then
        expect(participantShape).to.have.bounds(newParticipantBounds);
        expect(laneShape).to.have.bounds(expectedLaneBounds);
      }));


      it('should move up above Lane', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            nextLaneShape = elementRegistry.get('Lane_B'),
            nestedLaneShape = elementRegistry.get('Nested_Lane_C'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { bottom: -50 });

        var expectedParticipantBounds = getBounds(participantShape),
            expectedNextLaneBounds = resizeTRBL(nextLaneShape, { top: -50 + 1 /* compensation */ }),
            expectedNestedLaneBounds = resizeTRBL(nestedLaneShape, { bottom: -50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
        expect(nestedLaneShape).to.have.bounds(expectedNestedLaneBounds);
        expect(nextLaneShape).to.have.bounds(expectedNextLaneBounds);
      }));


      it('should move down below Lane', inject(function(elementRegistry, modeling) {

        // given
        var laneShape = elementRegistry.get('Lane_A'),
            nextLaneShape = elementRegistry.get('Lane_B'),
            nestedLaneShape = elementRegistry.get('Nested_Lane_C'),
            participantShape = elementRegistry.get('Participant_Lane');

        var newLaneBounds = resizeTRBL(laneShape, { bottom: 50 });

        var expectedParticipantBounds = getBounds(participantShape),
            expectedNextLaneBounds = resizeTRBL(nextLaneShape, { top: 50 + 1 /* compensation */ }),
            expectedNestedLaneBounds = resizeTRBL(nestedLaneShape, { bottom: 50 });

        // when
        modeling.resizeLane(laneShape, newLaneBounds);

        // then
        expect(laneShape).to.have.bounds(newLaneBounds);
        expect(participantShape).to.have.bounds(expectedParticipantBounds);
        expect(nestedLaneShape).to.have.bounds(expectedNestedLaneBounds);
        expect(nextLaneShape).to.have.bounds(expectedNextLaneBounds);
      }));

    });

  });


  describe('horizontal', function() {

    it('should expand Lane left', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          participantShape = elementRegistry.get('Participant_Lane');

      var newLaneBounds = resizeTRBL(laneShape, { left: -50 });

      var expectedParticipantBounds = resizeTRBL(participantShape, { left: -50 });

      // when
      modeling.resizeLane(laneShape, newLaneBounds);

      // then
      expect(laneShape).to.have.bounds(newLaneBounds);
      expect(participantShape).to.have.bounds(expectedParticipantBounds);
    }));


    it('should shrink Lane left', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          participantShape = elementRegistry.get('Participant_Lane');

      var newLaneBounds = resizeTRBL(laneShape, { left: 50 });

      var expectedParticipantBounds = resizeTRBL(participantShape, { left: 50 });

      // when
      modeling.resizeLane(laneShape, newLaneBounds);

      // then
      expect(laneShape).to.have.bounds(newLaneBounds);
      expect(participantShape).to.have.bounds(expectedParticipantBounds);
    }));


    it('should shrink Participant left', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          participantShape = elementRegistry.get('Participant_Lane');

      var newParticipantBounds = resizeTRBL(participantShape, { left: 50 });

      var expectedLaneBounds = resizeTRBL(laneShape, { left: 50 });

      // when
      modeling.resizeLane(participantShape, newParticipantBounds);

      // then
      expect(participantShape).to.have.bounds(newParticipantBounds);
      expect(laneShape).to.have.bounds(expectedLaneBounds);
    }));


    it('should shrink Lane right', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          nextLaneShape = elementRegistry.get('Lane_B'),
          nestedLaneShape = elementRegistry.get('Nested_Lane_C'),
          participantShape = elementRegistry.get('Participant_Lane');

      var newLaneBounds = resizeTRBL(laneShape, { right: -50 });

      var expectedParticipantBounds = resizeTRBL(participantShape, { right: -50 }),
          expectedNextLaneBounds = resizeTRBL(nextLaneShape, { right: -50 }),
          expectedNestedLaneBounds = resizeTRBL(nestedLaneShape, { right: -50 });

      // when
      modeling.resizeLane(laneShape, newLaneBounds);

      // then
      expect(laneShape).to.have.bounds(newLaneBounds);
      expect(participantShape).to.have.bounds(expectedParticipantBounds);
      expect(nestedLaneShape).to.have.bounds(expectedNestedLaneBounds);
      expect(nextLaneShape).to.have.bounds(expectedNextLaneBounds);
    }));


    it('should expand Lane right', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane_A'),
          nextLaneShape = elementRegistry.get('Lane_B'),
          nestedLaneShape = elementRegistry.get('Nested_Lane_C'),
          participantShape = elementRegistry.get('Participant_Lane');

      var newLaneBounds = resizeTRBL(laneShape, { right: 50 });

      var expectedParticipantBounds = resizeTRBL(participantShape, { right: 50 }),
          expectedNextLaneBounds = resizeTRBL(nextLaneShape, { right: 50 }),
          expectedNestedLaneBounds = resizeTRBL(nestedLaneShape, { right: 50 });

      // when
      modeling.resizeLane(laneShape, newLaneBounds);

      // then
      expect(laneShape).to.have.bounds(newLaneBounds);
      expect(participantShape).to.have.bounds(expectedParticipantBounds);
      expect(nestedLaneShape).to.have.bounds(expectedNestedLaneBounds);
      expect(nextLaneShape).to.have.bounds(expectedNextLaneBounds);
    }));

  });

});
