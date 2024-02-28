import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';
import globalConnectModule from 'diagram-js/lib/features/global-connect';
import connectionPreview from 'diagram-js/lib/features/connection-preview';
import bendpointsModule from 'diagram-js/lib/features/bendpoints';

import { createCanvasEvent as canvasEvent } from '../../../../util/MockEvents';

var testModules = [
  coreModule,
  createModule,
  moveModule,
  modelingModule
];


describe('features/modeling/behavior - fix hover', function() {

  describe('drop on lane', function() {

    var diagramXML = require('./FixHoverBehavior.participant.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var lane,
        laneGfx,
        participant,
        participantGfx;

    beforeEach(inject(function(elementRegistry) {
      participant = elementRegistry.get('Participant_1');
      participantGfx = elementRegistry.getGraphics(participant);

      lane = elementRegistry.get('Lane_1');
      laneGfx = elementRegistry.getGraphics(lane);
    }));


    describe('create', function() {

      it('should <create.hover> participant', inject(
        function(create, dragging, elementFactory) {

          // given
          var task = elementFactory.createShape({ type: 'bpmn:Task' });

          create.start(canvasEvent({ x: 0, y: 0 }), task, true);

          // when
          dragging.hover({ element: lane, gfx: laneGfx });

          dragging.move(canvasEvent({ x: 200, y: 200 }));

          dragging.end();

          // then
          expect(task.parent).to.equal(participant);
        }
      ));


      it('should <create.out> participant', inject(
        function(create, dragging, elementFactory, eventBus) {

          // given
          var task = elementFactory.createShape({ type: 'bpmn:Task' });

          var outSpy = sinon.spy(function(event) {
            expect(event.hover).to.eql(participant);
            expect(event.hoverGfx).to.eql(participantGfx);
          });

          eventBus.on('create.out', outSpy);

          create.start(canvasEvent({ x: 0, y: 0 }), task, true);

          dragging.hover({ element: lane, gfx: laneGfx });

          dragging.move(canvasEvent({ x: 200, y: 200 }));

          // when
          dragging.out({ element: lane, gfx: laneGfx });

          dragging.end();

          // then
          expect(outSpy).to.have.been.calledOnce;
        }
      ));

    });


    describe('move', function() {

      it('should <shape.move.hover> participant', inject(
        function(dragging, elementRegistry, move) {

          // given
          var task = elementRegistry.get('Task_1');

          move.start(canvasEvent({ x: 440, y: 220 }), task, true);

          // when
          dragging.hover({ element: lane, gfx: laneGfx });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          dragging.end();

          // then
          expect(task.parent).to.equal(participant);
        }
      ));


      it('should <shape.move.out> participant', inject(
        function(dragging, elementRegistry, move, eventBus) {

          // given
          var task = elementRegistry.get('Task_1');

          var outSpy = sinon.spy(function(event) {
            expect(event.hover).to.eql(participant);
            expect(event.hoverGfx).to.eql(participantGfx);
          });

          eventBus.on('shape.move.out', outSpy);

          move.start(canvasEvent({ x: 440, y: 220 }), task, true);

          dragging.hover({ element: lane, gfx: laneGfx });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          // when
          dragging.out({ element: lane, gfx: laneGfx });

          // then
          expect(outSpy).to.have.been.calledOnce;
        }
      ));

    });

  });


  describe('label', function() {

    var diagramXML = require('./FixHoverBehavior.label.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    describe('move', function() {

      it('should <shape.move.hover> root', inject(
        function(dragging, elementRegistry, move, canvas) {

          // given
          var startEvent = elementRegistry.get('StartEvent');

          var label = startEvent.label;

          move.start(canvasEvent({ x: 175, y: 150 }), label, true);

          // when
          dragging.hover({ element: startEvent, gfx: elementRegistry.getGraphics(startEvent) });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          dragging.end();

          // then
          expect(label.parent).to.equal(canvas.getRootElement());
        }
      ));

    });

  });


  describe('group', function() {

    var diagramXML = require('./FixHoverBehavior.group.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    describe('create', function() {

      it('should <create.hover> root', inject(
        function(dragging, elementFactory, elementRegistry, create, canvas) {

          // given
          var task = elementRegistry.get('Task');

          var group = elementFactory.createShape({ type: 'bpmn:Group' });

          create.start(canvasEvent({ x: 0, y: 0 }), group, true);

          // when
          dragging.hover({ element: task, gfx: elementRegistry.getGraphics(task) });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          dragging.end();

          // then
          expect(group.parent).to.equal(canvas.getRootElement());
        }
      ));

    });


    describe('move', function() {

      it('should <shape.move.hover> root', inject(
        function(dragging, elementRegistry, move, canvas) {

          // given
          var task = elementRegistry.get('Task');
          var group = elementRegistry.get('Group');

          move.start(canvasEvent({ x: 175, y: 150 }), group, true);

          // when
          dragging.hover({ element: task, gfx: elementRegistry.getGraphics(task) });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          dragging.end();

          // then
          expect(group.parent).to.equal(canvas.getRootElement());
        }
      ));

    });

  });


  describe('Annotation', function() {

    var diagramXML = require('./FixHoverBehavior.annotation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    describe('create', function() {

      it('should <create.hover> root', inject(
        function(dragging, elementFactory, elementRegistry, create, canvas) {

          // given
          var task = elementRegistry.get('Task');

          var annotation = elementFactory.createShape({ type: 'bpmn:TextAnnotation' });

          create.start(canvasEvent({ x: 0, y: 0 }), annotation, true);

          // when
          dragging.hover({ element: task, gfx: elementRegistry.getGraphics(task) });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          dragging.end();

          // then
          expect(annotation.parent).to.equal(canvas.getRootElement());
        }
      ));

    });


    describe('move', function() {

      it('should <shape.move.hover> root', inject(
        function(dragging, elementRegistry, move, canvas) {

          // given
          var task = elementRegistry.get('Task');
          var annotation = elementRegistry.get('TextAnnotation_1');

          move.start(canvasEvent({ x: 175, y: 150 }), annotation, true);

          // when
          dragging.hover({ element: task, gfx: elementRegistry.getGraphics(task) });

          dragging.move(canvasEvent({ x: 240, y: 220 }));

          dragging.end();

          // then
          expect(annotation.parent).to.equal(canvas.getRootElement());
        }
      ));

    });

  });


  describe('connect lane', function() {

    var diagramXML = require('./FixHoverBehavior.lane-connect.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat([
        globalConnectModule,
        bendpointsModule,
        connectionPreview
      ])
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    describe('global-connect', function() {

      it('should set global connect source to participant', inject(
        function(globalConnect, elementRegistry, eventBus, dragging) {

          // given
          var participant_lanes = elementRegistry.get('Participant_Lanes');
          var lane_1 = elementRegistry.get('Lane_1');

          var connectSpy = sinon.spy(function(event) {
            expect(event.context.startTarget).to.eql(participant_lanes);
          });

          eventBus.once('global-connect.end', connectSpy);

          // when
          globalConnect.start(canvasEvent({ x: 0, y: 0 }));

          dragging.move(canvasEvent({ x: 150, y: 130 }));
          dragging.hover(canvasEvent({ x: 150, y: 130 }, { element: lane_1 }));
          dragging.end(canvasEvent({ x: 0, y: 0 }));

          // then
          expect(connectSpy).to.have.been.called;
        }
      ));


      describe('fix hover', function() {

        it('on out', inject(
          function(globalConnect, dragging, elementRegistry, eventBus) {

            // given
            var participant_lanes = elementRegistry.get('Participant_Lanes');
            var lane_1 = elementRegistry.get('Lane_1');

            var connectSpy = sinon.spy(function(event) {
              expect(event.hover).to.eql(participant_lanes);
            });

            // when
            globalConnect.start(canvasEvent({ x: 240, y: 0 }));

            dragging.move(canvasEvent({ x: 240, y: 300 }));
            dragging.hover(canvasEvent({ x: 240, y: 300 }, { element: lane_1 }));

            eventBus.once('global-connect.out', connectSpy);

            dragging.out();

            // then
            expect(connectSpy).to.have.been.calledOnce;
          }
        ));


        it('on end/cleanup', inject(
          function(globalConnect, dragging, elementRegistry, eventBus) {

            // given
            var participant_lanes = elementRegistry.get('Participant_Lanes');
            var lane_1 = elementRegistry.get('Lane_1');

            var connectSpy = sinon.spy(function(event) {
              expect(event.hover).to.eql(participant_lanes);
            });

            eventBus.on('global-connect.end', connectSpy);
            eventBus.on('global-connect.cleanup', connectSpy);

            // when
            globalConnect.start(canvasEvent({ x: 240, y: 0 }));

            dragging.move(canvasEvent({ x: 240, y: 300 }));

            dragging.hover(canvasEvent({ x: 240, y: 300 }, { element: lane_1 }));
            dragging.end();

            // then
            expect(connectSpy).to.have.been.calledTwice;
          }
        ));

      });
    });


    describe('reconnect', function() {

      it('should set hover to participant', inject(
        function(bendpointMove, elementRegistry, eventBus, dragging) {

          // given
          var participant_lanes = elementRegistry.get('Participant_Lanes');
          var lane_1 = elementRegistry.get('Lane_1');

          var messageFlow = elementRegistry.get('MessageFlow_2');

          var connectSpy = sinon.spy(function(event) {
            expect(event.context.hover).to.equal(participant_lanes);
          });

          eventBus.once('bendpoint.move.end', connectSpy);

          // when
          bendpointMove.start(canvasEvent({ x: 240, y: 200 }), messageFlow, 0);
          dragging.move(canvasEvent({ x: 240, y: 280 }));

          dragging.hover({ element: lane_1, gfx: elementRegistry.getGraphics(lane_1) });
          dragging.end();

          // then
          expect(connectSpy).to.have.been.called;
        }
      ));


      it('should set end to participant', inject(
        function(bendpointMove, elementRegistry, eventBus, dragging) {

          // given
          var participant_lanes = elementRegistry.get('Participant_Lanes');
          var lane_1 = elementRegistry.get('Lane_1');

          var messageFlow = elementRegistry.get('MessageFlow_1');

          var connectSpy = sinon.spy(function(event) {
            expect(event.context.target).to.eql(participant_lanes);
          });

          eventBus.once('bendpoint.move.end', connectSpy);

          // when
          bendpointMove.start(canvasEvent({ x: 240, y: 200 }), messageFlow, 1);
          dragging.move(canvasEvent({ x: 240, y: 280 }));

          dragging.hover({ element: lane_1, gfx: elementRegistry.getGraphics(lane_1) });
          dragging.end();

          // then
          expect(connectSpy).to.have.been.called;
        }
      ));

    });


    describe('connect', function() {

      it('should set start to participant', inject(
        function(connect, dragging, elementRegistry, eventBus) {

          // given
          var participant_lanes = elementRegistry.get('Participant_Lanes');
          var participant_no_lanes = elementRegistry.get('Participant_No_Lanes');
          var lane_1 = elementRegistry.get('Lane_1');

          var connectSpy = sinon.spy(function(event) {
            expect(event.context.source).to.eql(participant_lanes);
          });

          eventBus.once('connect.end', connectSpy);

          // when
          connect.start(canvasEvent({ x: 240, y: 300 }), lane_1);

          dragging.move(canvasEvent({ x: 240, y: 0 }));

          dragging.hover(canvasEvent({ x: 240, y: 0 }, { element: participant_no_lanes }));

          dragging.end();

          // then
          expect(connectSpy).to.have.been.called;
        }
      ));


      it('should set end to participant', inject(
        function(connect, dragging, elementRegistry, eventBus) {

          // given
          var participant_lanes = elementRegistry.get('Participant_Lanes');
          var participant_no_lanes = elementRegistry.get('Participant_No_Lanes');
          var lane_1 = elementRegistry.get('Lane_1');

          var connectSpy = sinon.spy(function(event) {

            var context = event.context,
                target = context.target;

            expect(target).to.eql(participant_lanes);
          });

          eventBus.once('connect.end', connectSpy);

          // when
          connect.start(canvasEvent({ x: 240, y: 0 }), participant_no_lanes);

          dragging.move(canvasEvent({ x: 240, y: 300 }));

          dragging.hover(canvasEvent({ x: 240, y: 300 }, { element: lane_1 }));
          dragging.end();

          // then
          expect(connectSpy).to.have.been.calledOnce;
        }
      ));


      describe('fix hover', function() {

        it('on out', inject(
          function(connect, dragging, elementRegistry, eventBus) {

            // given
            var participant_lanes = elementRegistry.get('Participant_Lanes');
            var participant_no_lanes = elementRegistry.get('Participant_No_Lanes');
            var lane_1 = elementRegistry.get('Lane_1');

            var connectSpy = sinon.spy(function(event) {
              expect(event.hover).to.eql(participant_lanes);
            });

            // when
            connect.start(canvasEvent({ x: 240, y: 0 }), participant_no_lanes);

            dragging.move(canvasEvent({ x: 240, y: 300 }));
            dragging.hover(canvasEvent({ x: 240, y: 300 }, { element: lane_1 }));

            eventBus.once('connect.out', connectSpy);

            dragging.out();

            // then
            expect(connectSpy).to.have.been.calledOnce;
          }
        ));


        it('on end/cleanup', inject(
          function(connect, dragging, elementRegistry, eventBus) {

            // given
            var participant_lanes = elementRegistry.get('Participant_Lanes');
            var participant_no_lanes = elementRegistry.get('Participant_No_Lanes');
            var lane_1 = elementRegistry.get('Lane_1');

            var connectSpy = sinon.spy(function(event) {
              expect(event.hover).to.eql(participant_lanes);
            });

            eventBus.on('connect.end', connectSpy);
            eventBus.on('connect.cleanup', connectSpy);

            // when
            connect.start(canvasEvent({ x: 240, y: 0 }), participant_no_lanes);

            dragging.move(canvasEvent({ x: 240, y: 300 }));

            dragging.hover(canvasEvent({ x: 240, y: 300 }, { element: lane_1 }));
            dragging.end();

            // then
            expect(connectSpy).to.have.been.calledTwice;
          }
        ));

      });

    });

  });


  describe('participant with lane', function() {

    var diagramXML = require('./FixHoverBehavior.lane-connect.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat([
        globalConnectModule,
        bendpointsModule
      ])
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should move the participant when lane is dragged', inject(
      function(canvas, eventBus, elementRegistry, move, dragging) {

        // given
        var lane = elementRegistry.get('Lane_1'),
            participant = elementRegistry.get('Participant_Lanes');

        var rootElement = canvas.getRootElement(),
            rootElementGfx = canvas.getGraphics(rootElement);

        var moveEndSpy = sinon.spy(function(event) {
          expect(event.context.shape).to.equal(participant);
        });

        eventBus.on('shape.move.end', moveEndSpy);

        // when
        move.start(canvasEvent({ x: 100, y: 100 }), lane);

        dragging.move(canvasEvent({ x: 140, y: 120 }));

        dragging.hover({
          element: rootElement,
          gfx: rootElementGfx
        });

        dragging.end();

        // then
        expect(moveEndSpy).to.have.been.calledOnce;
      }
    ));

  });


  describe('space tool', function() {

    var diagramXML = require('./FixHoverBehavior.participant.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should <spaceTool.move> participant', inject(
      function(dragging, elementRegistry, spaceTool) {

        // given
        var lane = elementRegistry.get('Lane_1'),
            participant = elementRegistry.get('Participant_1');

        spaceTool.activateMakeSpace(canvasEvent({ x: 150, y: 0 }));

        expect(participant.width).to.equal(600);

        // when
        dragging.hover({ element: lane });

        dragging.move(canvasEvent({ x: 250, y: 0 }, {
          button: 0,
          shiftKey: true
        }));

        dragging.end();

        // then
        expect(participant.width).to.equal(700);
      }
    ));

  });

});