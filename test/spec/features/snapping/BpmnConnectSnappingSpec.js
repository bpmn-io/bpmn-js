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


  describe('association', function() {

    describe('connect', function() {

      it('should snap target', inject(function(connect, dragging, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            dataObjectReference = elementRegistry.get('DataObjectReference_1'),
            dataObjectReferenceGfx = elementRegistry.getGraphics(dataObjectReference);

        // when
        connect.start(canvasEvent({ x: 300, y: 300 }), task);

        dragging.hover({ element: dataObjectReference, gfx: dataObjectReferenceGfx });

        dragging.move(canvasEvent({ x: 410, y: 410 }));

        dragging.end();

        // then
        var waypoints = task.outgoing[0].waypoints;

        expect(waypoints[1].original).to.eql({ x: 400, y: 400 });
      }));

    });

  });


  describe('sequence flow', function() {

    describe('connect', function() {

      it('should snap target', inject(function(connect, dragging, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            endEvent = elementRegistry.get('EndEvent_1'),
            endEventGfx = elementRegistry.getGraphics(endEvent);

        // when
        connect.start(canvasEvent({ x: 100, y: 100 }), startEvent);

        dragging.hover({ element: endEvent, gfx: endEventGfx });

        dragging.move(canvasEvent({ x: 210, y: 210 }));

        dragging.end();

        // then
        var waypoints = startEvent.outgoing[0].waypoints;

        expect(waypoints[3].original).to.eql({ x: 200, y: 200 });
      }));

    });


    describe('global connect', function() {

      it('should snap target', inject(
        function(connect, dragging, elementRegistry, eventBus) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1'),
              endEvent = elementRegistry.get('EndEvent_1'),
              endEventGfx = elementRegistry.getGraphics(endEvent);

          // when
          connect.start(null, startEvent, { x: 110, y: 110 });

          dragging.hover({ element: endEvent, gfx: endEventGfx });

          dragging.move(canvasEvent({ x: 210, y: 210 }));

          dragging.end();

          // then
          var waypoints = startEvent.outgoing[0].waypoints;

          expect(waypoints[0].original).to.eql({ x: 100, y: 100 });
          expect(waypoints[3].original).to.eql({ x: 200, y: 200 });
        }
      ));

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