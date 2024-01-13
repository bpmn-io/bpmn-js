import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';
import spaceToolModule from 'diagram-js/lib/features/space-tool';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';

import {
  GROUP_MIN_DIMENSIONS,
  LANE_MIN_DIMENSIONS,
  PARTICIPANT_MIN_DIMENSIONS,
  VERTICAL_LANE_MIN_DIMENSIONS,
  VERTICAL_PARTICIPANT_MIN_DIMENSIONS,
  SUB_PROCESS_MIN_DIMENSIONS
} from 'lib/features/modeling/behavior/ResizeBehavior';

var testModules = [
  coreModule,
  modelingModule,
  rulesModule,
  snappingModule,
  spaceToolModule
];


describe('features/modeling - space tool behavior', function() {

  describe('subprocess', function() {

    describe('minimum dimensions', function() {

      var diagramXML = require('./SpaceToolBehaviorSpec.subprocess.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should ensure subprocess minimum dimensions', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(subProcess.width).to.equal(SUB_PROCESS_MIN_DIMENSIONS.width);
        })
      );

    });

  });


  describe('participant', function() {

    describe('minimum dimensions', function() {

      var diagramXML = require('./SpaceToolBehaviorSpec.participant.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should ensure participant minimum width', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var participant = elementRegistry.get('Participant_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 0 }));

          dragging.move(canvasEvent({ x: -200, y: 0 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(PARTICIPANT_MIN_DIMENSIONS.width);
        })
      );


      it('should ensure participant minimum height', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var participant = elementRegistry.get('Participant_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 100 }));

          dragging.move(canvasEvent({ x: 0, y: -400 }));

          dragging.end();

          // then
          expect(participant.height).to.equal(PARTICIPANT_MIN_DIMENSIONS.height);
        })
      );


      it('should ensure lane minimum width', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var participant = elementRegistry.get('Participant_2');
          var lane = elementRegistry.get('Lane_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 1200, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(lane.width).to.equal(LANE_MIN_DIMENSIONS.width);
          expect(participant.width).to.equal(LANE_MIN_DIMENSIONS.width + 30);
        })
      );


      it('should ensure lane minimum height', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var lane = elementRegistry.get('Lane_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 400 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(lane.height).to.equal(LANE_MIN_DIMENSIONS.height);
        })
      );


      it('should ensure nested lane minimum height', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var lane = elementRegistry.get('Lane_6');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 925 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(lane.height).to.equal(LANE_MIN_DIMENSIONS.height);
        })
      );

    });

  });


  describe('vertical participant', function() {

    describe('minimum dimensions', function() {

      var diagramXML = require('./SpaceToolBehaviorSpec.participant.vertical.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should ensure participant minimum height', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var participant = elementRegistry.get('Vertical_Participant_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 300 }));

          dragging.move(canvasEvent({ x: 0, y: -200 }));

          dragging.end();

          // then
          expect(participant.height).to.equal(VERTICAL_PARTICIPANT_MIN_DIMENSIONS.height);
        })
      );


      it('should ensure participant minimum width', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var participant = elementRegistry.get('Vertical_Participant_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 100, y: 0 }));

          dragging.move(canvasEvent({ x: -400, y: 0 }));

          dragging.end();

          // then
          expect(participant.width).to.equal(VERTICAL_PARTICIPANT_MIN_DIMENSIONS.width);
        })
      );


      it('should ensure lane minimum height', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var participant = elementRegistry.get('Vertical_Participant_2');
          var lane = elementRegistry.get('Vertical_Lane_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 1200 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(lane.height).to.equal(VERTICAL_LANE_MIN_DIMENSIONS.height);
          expect(participant.height).to.equal(VERTICAL_LANE_MIN_DIMENSIONS.height + 30);
        })
      );


      it('should ensure lane minimum width', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var lane = elementRegistry.get('Vertical_Lane_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 400, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(lane.width).to.equal(VERTICAL_LANE_MIN_DIMENSIONS.width);
        })
      );


      it('should ensure nested lane minimum width', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var lane = elementRegistry.get('V_Lane_6');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 925, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(lane.width).to.equal(VERTICAL_LANE_MIN_DIMENSIONS.width);
        })
      );

    });

  });


  describe('group', function() {

    describe('minimum dimensions', function() {

      var diagramXML = require('./SpaceToolBehaviorSpec.group.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should ensure group minimum dimensions', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var group = elementRegistry.get('Group_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 450, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(group.width).to.equal(GROUP_MIN_DIMENSIONS.width);
        })
      );

    });

  });

});