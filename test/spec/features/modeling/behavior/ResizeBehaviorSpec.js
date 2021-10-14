import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import resizeModule from 'diagram-js/lib/features/resize';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';

import {
  getParticipantResizeConstraints
} from 'lib/features/modeling/behavior/ResizeBehavior';

var testModules = [
  coreModule,
  modelingModule,
  resizeModule,
  rulesModule,
  snappingModule
];


describe('features/modeling - resize behavior', function() {

  describe('participant', function() {

    describe('minimum dimensions', function() {

      var diagramXML = require('./ResizeBehavior.participant.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should snap to children from <se>', inject(function(dragging, elementRegistry, resize) {

        // given
        var participant = elementRegistry.get('Participant_2');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');

        dragging.move(canvasEvent({ x: 0, y: 0 }));

        dragging.end();

        // then
        expect(participant.width).to.equal(482);
        expect(participant.height).to.equal(252);
      }));


      it('should snap to children from <nw>', inject(function(dragging, elementRegistry, resize) {

        // given
        var participant = elementRegistry.get('Participant_2');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');

        dragging.move(canvasEvent({ x: 500, y: 500 }));

        dragging.end();

        // then
        expect(participant.width).to.equal(467);
        expect(participant.height).to.equal(287);
      }));


      it('should snap to min dimensions from <se>', inject(
        function(dragging, elementRegistry, resize) {

          // given
          var participant = elementRegistry.get('Participant_1');

          // when
          resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(300);
          expect(participant.height).to.equal(60);
        })
      );


      it('should snap to min dimensions from <nw>', inject(
        function(dragging, elementRegistry, resize) {

          // given
          var participant = elementRegistry.get('Participant_1');

          // when
          resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');

          dragging.move(canvasEvent({ x: 500, y: 500 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(300);
          expect(participant.height).to.equal(60);
        })
      );


      it('should snap to min dimensions + children from <se>', inject(
        function(dragging, elementRegistry, resize) {

          // given
          var participant = elementRegistry.get('Participant_3');

          // when
          resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(305);
          expect(participant.height).to.equal(143);
        })
      );


      it('should snap to min dimensions + children from <nw>', inject(
        function(dragging, elementRegistry, resize) {

          // given
          var participant = elementRegistry.get('Participant_3');

          // when
          resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');

          dragging.move(canvasEvent({ x: 500, y: 500 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(353);
          expect(participant.height).to.equal(177);
        })
      );

    });


    describe('resize constraints', function() {

      var diagramXML = require('./ResizeBehavior.lanes.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should snap to child lanes from <nw>', inject(
        function(dragging, elementRegistry, resize) {

          // given
          var participant = elementRegistry.get('Participant');

          // when
          resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');

          dragging.move(canvasEvent({ x: 500, y: 500 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(563);
          expect(participant.height).to.equal(223);
        })
      );


      it('should snap to nested child lanes from <se>', inject(
        function(dragging, elementRegistry, resize) {

          // given
          var lane = elementRegistry.get('Lane_B_0');

          // when
          resize.activate(canvasEvent({ x: 0, y: 0 }), lane, 'se');

          dragging.move(canvasEvent({ x: -500, y: -500 }));

          dragging.end();

          // then
          expect(lane.width).to.equal(313);
          expect(lane.height).to.equal(122);
        })
      );

    });

  });


  describe('sub process', function() {

    var diagramXML = require('./ResizeBehavior.subProcess.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should set minimum dimensions', inject(function(dragging, elementRegistry, resize) {

      // given
      var subProcess = elementRegistry.get('SubProcess');

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), subProcess, 'se');

      dragging.move(canvasEvent({ x: -400, y: -400 }));

      dragging.end();

      // then
      expect(subProcess.width).to.equal(140);
      expect(subProcess.height).to.equal(120);
    }));

  });


  describe('text annotation', function() {

    var diagramXML = require('./ResizeBehavior.textAnnotation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should set minimum dimensions', inject(function(dragging, elementRegistry, resize) {

      // given
      var textAnnotation = elementRegistry.get('TextAnnotation');

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), textAnnotation, 'se');

      dragging.move(canvasEvent({ x: -400, y: -400 }));

      dragging.end();

      // then
      expect(textAnnotation.width).to.equal(50);
      expect(textAnnotation.height).to.equal(30);
    }));

  });

});


var LANE_MIN_HEIGHT = 60,
    LANE_RIGHT_PADDING = 20,
    LANE_LEFT_PADDING = 50,
    LANE_TOP_PADDING = 20,
    LANE_BOTTOM_PADDING = 20;

describe('modeling/behavior - resize behavior - utilities', function() {

  describe('#getParticipantResizeConstraints', function() {

    describe('lanes', function() {

      var diagramXML = require('./ResizeBehavior.utility.lanes.bpmn');

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

      var diagramXML = require('./ResizeBehavior.utility.lanes-flowNodes.bpmn');

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