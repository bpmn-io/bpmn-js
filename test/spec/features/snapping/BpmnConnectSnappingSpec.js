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

    describe('connect', function() {

      it('should snap event if close to target bounds',
        inject(function(connect, dragging, elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent'),
              subProcess = elementRegistry.get('SubProcess'),
              subProcessGfx = elementRegistry.getGraphics(subProcess);

          // when
          connect.start(canvasEvent({ x: 600, y: 300 }), boundaryEvent);

          dragging.hover({ element: subProcess, gfx: subProcessGfx });

          dragging.move(canvasEvent({ x: 400, y: 305 }));

          dragging.end();

          // then
          var waypoints = boundaryEvent.outgoing[0].waypoints;

          expect(waypoints[3].y).to.eql(280);
        })
      );
    });
  });


  describe('message flow', function() {

    describe('connect', function() {

      it('should snap target', inject(function(connect, dragging, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_1'),
            intermediateCatchEventGfx = elementRegistry.getGraphics(intermediateCatchEvent);

        // when
        connect.start(canvasEvent({ x: 300, y: 300 }), task);

        dragging.hover({ element: intermediateCatchEvent, gfx: intermediateCatchEventGfx });

        dragging.move(canvasEvent({ x: 210, y: 610 }));

        dragging.end();

        // then
        var waypoints = task.outgoing[0].waypoints;

        expect(waypoints[3].original).to.eql({ x: 200, y: 600 });
      }));

    });


    describe('global connect', function() {

      it('should snap source', inject(function(connect, dragging, elementRegistry) {

        // given
        var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1'),
            task = elementRegistry.get('Task_1'),
            taskGfx = elementRegistry.getGraphics(task);

        // when
        connect.start(null, intermediateThrowEvent, { x: 110, y: 610 });

        dragging.hover({ element: task, gfx: taskGfx });

        dragging.move(canvasEvent({ x: 310, y: 310 }));

        dragging.end();

        // then
        var waypoints = intermediateThrowEvent.outgoing[0].waypoints;

        expect(waypoints[0].original).to.eql({ x: 100, y: 600 });
        expect(waypoints[3].original).to.eql({ x: 310, y: 310 }); // NOT snapped
      }));


      it('should snap target', inject(function(connect, dragging, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_1'),
            intermediateCatchEventGfx = elementRegistry.getGraphics(intermediateCatchEvent);

        // when
        connect.start(null, task, { x: 310, y: 310 });

        dragging.hover({ element: intermediateCatchEvent, gfx: intermediateCatchEventGfx });

        dragging.move(canvasEvent({ x: 210, y: 610 }));

        dragging.end();

        // then
        var waypoints = task.outgoing[0].waypoints;

        expect(waypoints[0].original).to.eql({ x: 310, y: 310 }); // NOT snapped
        expect(waypoints[3].original).to.eql({ x: 200, y: 600 });
      }));

    });

  });

});