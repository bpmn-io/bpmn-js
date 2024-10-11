import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import connectModule from 'diagram-js/lib/features/connect';
import coreModule from 'lib/core';
import globalConnectModule from 'diagram-js/lib/features/global-connect';
import modelingModule from 'lib/features/modeling';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';


describe('features/snapping - BpmnConnectSnapping', function() {

  var testModules = [
    connectModule,
    coreModule,
    globalConnectModule,
    modelingModule,
    rulesModule,
    snappingModule
  ];

  var diagramXML = require('./BpmnConnectSnapping.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  describe('sequence flow', function() {

    describe('boundary event loop', function() {

      it('should snap left', inject(
        function(connect, dragging, elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_Bottom'),
              subProcess = elementRegistry.get('SubProcess'),
              subProcessGfx = elementRegistry.getGraphics(subProcess);

          // when
          connect.start(canvasEvent({ x: 590, y: 200 }), boundaryEvent);

          dragging.hover({ element: subProcess, gfx: subProcessGfx });

          dragging.move(canvasEvent({ x: 400, y: 115 }));

          dragging.end();

          // then
          var waypoints = boundaryEvent.outgoing[0].waypoints;

          expect(waypoints).to.have.length(5);

          expect(waypoints[ 4 ].original).to.eql({
            x: 420,
            y: 115
          });
        }
      ));


      it('should snap bottom (from bottom)', inject(
        function(connect, dragging, elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_Bottom'),
              subProcess = elementRegistry.get('SubProcess'),
              subProcessGfx = elementRegistry.getGraphics(subProcess);

          // when
          connect.start(canvasEvent({ x: 630, y: 200 }), boundaryEvent);

          dragging.hover({ element: subProcess, gfx: subProcessGfx });

          dragging.move(canvasEvent({ x: 580, y: 115 }));

          dragging.end();

          // then
          var waypoints = boundaryEvent.outgoing[0].waypoints;

          expect(waypoints).to.have.length(4);

          expect(waypoints[ 3 ].original).to.eql({
            x: 550,
            y: 115
          });
        }
      ));


      it('should snap right', inject(
        function(connect, dragging, elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_Right'),
              subProcess = elementRegistry.get('SubProcess'),
              subProcessGfx = elementRegistry.getGraphics(subProcess);

          // when
          connect.start(canvasEvent({ x: 760, y: 130 }), boundaryEvent);

          dragging.hover({ element: subProcess, gfx: subProcessGfx });

          dragging.move(canvasEvent({ x: 580, y: 115 }));

          dragging.end();

          // then
          var waypoints = boundaryEvent.outgoing[0].waypoints;

          expect(waypoints).to.have.length(4);

          expect(waypoints[ 3 ].original).to.eql({
            x: 580,
            y: 90
          });
        }
      ));


      it('should snap bottom (from right)', inject(
        function(connect, dragging, elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_Right'),
              subProcess = elementRegistry.get('SubProcess'),
              subProcessGfx = elementRegistry.getGraphics(subProcess);

          // when
          connect.start(canvasEvent({ x: 760, y: 130 }), boundaryEvent);

          dragging.hover({ element: subProcess, gfx: subProcessGfx });

          dragging.move(canvasEvent({ x: 580, y: 200 }));

          dragging.end();

          // then
          var waypoints = boundaryEvent.outgoing[0].waypoints;

          expect(waypoints).to.have.length(5);

          expect(waypoints[ 4 ].original).to.eql({
            x: 580,
            y: 180
          });
        }
      ));

    });


    describe('activity target', function() {

      it('should snap to task mid', inject(
        function(connect, dragging, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_2'),
              task = elementRegistry.get('Task_3'),
              taskGfx = elementRegistry.getGraphics(task);

          // when
          connect.start(canvasEvent({ x: 80, y: 845 }), startEvent);

          dragging.hover({ element: task, gfx: taskGfx });

          dragging.move(canvasEvent({ x: 200, y: 850 }));

          dragging.end();

          // then
          var waypoints = startEvent.outgoing[0].waypoints;

          expect(waypoints).to.have.length(2);

          expect(waypoints[ 1 ].original).to.eql({
            x: 200,
            y: 845
          });
        }
      ));


      it('should snap to sub-process mid', inject(
        function(connect, dragging, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3'),
              subProcess = elementRegistry.get('SubProcess_1'),
              subProcessGfx = elementRegistry.getGraphics(subProcess);

          // when
          connect.start(canvasEvent({ x: 80, y: 1025 }), startEvent);

          dragging.hover({ element: subProcess, gfx: subProcessGfx });

          dragging.move(canvasEvent({ x: 325, y: 1030 }));

          dragging.end();

          // then
          var waypoints = startEvent.outgoing[0].waypoints;

          expect(waypoints).to.have.length(2);

          expect(waypoints[ 1 ].original).to.eql({
            x: 325,
            y: 1025
          });
        }
      ));

    });


    it('should to snap gateway target mid', inject(
      function(connect, dragging, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            gateway = elementRegistry.get('Gateway_1'),
            gatewayGfx = elementRegistry.getGraphics(gateway);

        // when
        connect.start(canvasEvent({ x: 80, y: 50 }), startEvent);

        dragging.hover({ element: gateway, gfx: gatewayGfx });

        dragging.move(canvasEvent({ x: 255, y: 55 }));

        dragging.end();

        // then
        var waypoints = startEvent.outgoing[0].waypoints;

        expect(waypoints).to.have.length(2);

        expect(waypoints[ 1 ].original).to.eql({
          x: 250,
          y: 50
        });
      }
    ));


    it('should snap to event target mid', inject(
      function(connect, dragging, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            endEvent = elementRegistry.get('EndEvent_1'),
            endEventGfx = elementRegistry.getGraphics(endEvent);

        // when
        connect.start(canvasEvent({ x: 80, y: 50 }), startEvent);

        dragging.hover({ element: endEvent, gfx: endEventGfx });

        dragging.move(canvasEvent({ x: 85, y: 245 }));

        dragging.end();

        // then
        var waypoints = startEvent.outgoing[0].waypoints;

        expect(waypoints).to.have.length(2);

        expect(waypoints[ 1 ].original).to.eql({
          x: 80,
          y: 240
        });
      }
    ));

  });


  describe('message flow', function() {

    describe('connect', function() {

      it('should snap target', inject(function(connect, dragging, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_1'),
            intermediateCatchEventGfx = elementRegistry.getGraphics(intermediateCatchEvent);

        // when
        connect.start(canvasEvent({ x: 250, y: 240 }), task);

        dragging.hover({ element: intermediateCatchEvent, gfx: intermediateCatchEventGfx });

        dragging.move(canvasEvent({ x: 185, y: 555 }));

        dragging.end();

        // then
        var waypoints = task.outgoing[0].waypoints;

        expect(waypoints).to.have.length(4);

        expect(waypoints[ 3 ].original).to.eql({
          x: 180,
          y: 550
        });
      }));

    });


    describe('global connect', function() {

      it('should snap source', inject(function(connect, dragging, elementRegistry) {

        // given
        var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1'),
            task = elementRegistry.get('Task_1'),
            taskGfx = elementRegistry.getGraphics(task);

        // when
        connect.start(null, intermediateThrowEvent, { x: 75, y: 555 });

        dragging.hover({ element: task, gfx: taskGfx });

        dragging.move(canvasEvent({ x: 290, y: 240 }));

        dragging.end();

        // then
        var waypoints = intermediateThrowEvent.outgoing[0].waypoints;

        expect(waypoints).to.have.length(4);

        expect(waypoints[ 0 ].original).to.eql({
          x: 70,
          y: 550
        });

        // NOT snapped
        expect(waypoints[ 3 ].original).to.eql({
          x: 290,
          y: 240
        });
      }));


      it('should snap target', inject(function(connect, dragging, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_1'),
            intermediateCatchEventGfx = elementRegistry.getGraphics(intermediateCatchEvent);

        // when
        connect.start(null, task, { x: 255, y: 245 });

        dragging.hover({ element: intermediateCatchEvent, gfx: intermediateCatchEventGfx });

        dragging.move(canvasEvent({ x: 185, y: 555 }));

        dragging.end();

        // then
        var waypoints = task.outgoing[0].waypoints;

        expect(waypoints).to.have.length(4);

        // NOT snapped
        expect(waypoints[ 0 ].original).to.eql({
          x: 255,
          y: 245
        });

        expect(waypoints[ 3 ].original).to.eql({
          x: 180,
          y: 550
        });
      }));

    });

  });

});
