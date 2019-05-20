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