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
  LANE_MIN_DIMENSIONS,
  PARTICIPANT_MIN_DIMENSIONS,
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

});