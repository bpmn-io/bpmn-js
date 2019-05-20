import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getParticipantResizeConstraints } from 'lib/features/modeling/behavior/util/ResizeUtil';

import coreModule from 'lib/core';

var LANE_MIN_HEIGHT = 60,
    LANE_RIGHT_PADDING = 20,
    LANE_LEFT_PADDING = 50,
    LANE_TOP_PADDING = 20,
    LANE_BOTTOM_PADDING = 20;


describe('modeling/behavior/util - Resize', function() {

  describe('#getParticipantResizeConstraints', function() {

    describe('lanes', function() {

      var diagramXML = require('./ResizeUtil.lanes.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: [ coreModule ] }));


      it('resize participant (S)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Participant_Lane'),
            otherLaneShape = elementRegistry.get('Lane_B');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 's');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            bottom: otherLaneShape.y + LANE_MIN_HEIGHT
          },
          max: {}
        });

      }));


      it('bottom lane (S)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Lane_B'),
            otherLaneShape = elementRegistry.get('Lane_B');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 's');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            bottom: otherLaneShape.y + LANE_MIN_HEIGHT
          },
          max: {}
        });

      }));


      it('resize participant (N)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Participant_Lane'),
            otherLaneShape = elementRegistry.get('Nested_Lane_A');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'n');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            top: otherLaneShape.y + otherLaneShape.height - LANE_MIN_HEIGHT
          },
          max: {}
        });

      }));


      it('resize top lane (N)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Lane_A'),
            otherLaneShape = elementRegistry.get('Nested_Lane_A');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'n');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            top: otherLaneShape.y + otherLaneShape.height - LANE_MIN_HEIGHT
          },
          max: {}
        });

      }));


      it('resize middle lane (N)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Nested_Lane_B'),
            aboveLaneShape = elementRegistry.get('Nested_Lane_A');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'n', true);

        // then
        expect(sizeConstraints).to.eql({
          min: {
            top: resizeShape.y + resizeShape.height - LANE_MIN_HEIGHT
          },
          max: {
            top: aboveLaneShape.y + LANE_MIN_HEIGHT
          }
        });

      }));


      it('resize middle lane (S)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Nested_Lane_B'),
            otherLaneShape = elementRegistry.get('Lane_B');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 's', true);

        // then
        expect(sizeConstraints).to.eql({
          min: {
            bottom: resizeShape.y + LANE_MIN_HEIGHT
          },
          max: {
            bottom: otherLaneShape.y + otherLaneShape.height - LANE_MIN_HEIGHT
          }
        });

      }));

    });


    describe('flowNodes', function() {

      var diagramXML = require('./ResizeUtil.lanes-flowNodes.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: [ coreModule ] }));


      it('resize participant (S)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Participant_Lane'),
            taskShape = elementRegistry.get('Task');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 's');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            bottom: taskShape.y + taskShape.height + LANE_BOTTOM_PADDING
          },
          max: {}
        });

      }));


      it('bottom lane (S)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Lane_B'),
            taskShape = elementRegistry.get('Task');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 's');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            bottom: taskShape.y + taskShape.height + LANE_BOTTOM_PADDING
          },
          max: {}
        });

      }));


      it('resize participant (N)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Participant_Lane'),
            taskShape = elementRegistry.get('Task_Boundary');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'n');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            top: taskShape.y - LANE_TOP_PADDING
          },
          max: {}
        });

      }));


      it('resize top lane (N)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Lane_A'),
            taskShape = elementRegistry.get('Task_Boundary');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'n');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            top: taskShape.y - LANE_TOP_PADDING
          },
          max: {}
        });

      }));


      it('resize lane (W)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Nested_Lane_B'),
            otherShape = elementRegistry.get('Boundary_label');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'w');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            left: otherShape.x - LANE_LEFT_PADDING
          },
          max: { }
        });

      }));


      it('resize lane (E)', inject(function(elementRegistry) {

        // given
        var resizeShape = elementRegistry.get('Lane_B'),
            otherShape = elementRegistry.get('Task');

        // when
        var sizeConstraints = getParticipantResizeConstraints(resizeShape, 'e');

        // then
        expect(sizeConstraints).to.eql({
          min: {
            right: otherShape.x + otherShape.width + LANE_RIGHT_PADDING
          },
          max: { }
        });

      }));

    });

  });

});