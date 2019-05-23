import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';

import {
  isSnapped,
  mid
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import { queryAll as domQueryAll } from 'min-dom';

import { attr as svgAttr } from 'tiny-svg';


describe('features/snapping - BpmnCreateMoveSnapping', function() {

  var testModules = [
    coreModule,
    createModule,
    modelingModule,
    moveModule,
    rulesModule,
    snappingModule
  ];


  describe('create participant', function() {

    describe('process', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.process.bpmn');


      it('should snap particpant if constrained', function(done) {

        bootstrapModeler(diagramXML, {
          container: TestContainer.get(this),
          modules: testModules
        })(function() {

          // when
          inject(function(canvas, create, dragging, elementFactory, eventBus) {

            // given
            dragging.setOptions({ manual: true });

            var participantShape = elementFactory.createParticipantShape(false),
                rootElement = canvas.getRootElement(),
                rootGfx = canvas.getGraphics(rootElement);

            create.start(canvasEvent({ x: 0, y: 0 }), participantShape);

            dragging.hover({ element: rootElement, gfx: rootGfx });

            eventBus.once('create.move', function(event) {

              // then
              // expect snapped to avoid snapping outside of constraints
              expect(isSnapped(event)).to.be.true;

              done();
            });

            // when
            dragging.move(canvasEvent({ x: 1000, y: 1000 }));
          })();

        });

      });

    });


    describe('collaboration', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.collaboration.bpmn');


      it('should snap to participant border with higher priority', function(done) {

        var container = TestContainer.get(this);

        bootstrapModeler(diagramXML, {
          container: container,
          modules: testModules
        })(function() {

          // when
          inject(function(create, dragging, elementFactory, elementRegistry, eventBus) {

            // given
            dragging.setOptions({ manual: true });

            var participant = elementFactory.createParticipantShape(false),
                collaboration = elementRegistry.get('Collaboration_1'),
                collaborationGfx = elementRegistry.getGraphics(collaboration);

            create.start(canvasEvent({ x: 0, y: 0 }), participant);

            dragging.hover({ element: collaboration, gfx: collaborationGfx });

            dragging.move(canvasEventTopLeft({ x: 0, y: 0 }, participant));

            eventBus.once('create.move', function(event) {

              // then
              // expect snap line at left border of participant
              expect(svgAttr(domQueryAll('.djs-snap-line', container)[1], 'd'))
                .to.equal('M 100,-100000 L 100, +100000');

              done();
            });

            // when
            dragging.move(canvasEventTopLeft({ x: 95, y: 400 }, participant));
          })();

        });

      });

    });

  });


  describe('boundary events', function() {

    describe('creating boundary event', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.process.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      var task, taskGfx, intermediateThrowEvent;

      beforeEach(inject(function(create, dragging, elementRegistry, elementFactory) {
        task = elementRegistry.get('Task_1');
        taskGfx = elementRegistry.getGraphics(task);

        intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        });

        create.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

        dragging.hover({ element: task, gfx: taskGfx });

        dragging.setOptions({ manual: false });
      }));


      it('should snap to top', inject(function(dragging) {

        // when
        dragging.move(canvasEvent({ x: 150, y: 95 }));

        dragging.end();

        // then
        var boundaryEvent = getBoundaryEvent(task);

        expect(mid(boundaryEvent)).to.eql({
          x: 150,
          y: 100 // 95 snapped to 100
        });
      }));


      it('should snap to right', inject(function(dragging) {

        // when
        dragging.move(canvasEvent({ x: 195, y: 140 }));

        dragging.end();

        // then
        var boundaryEvent = getBoundaryEvent(task);

        expect(mid(boundaryEvent)).to.eql({
          x: 200, // 195 snapped to 200
          y: 140
        });
      }));


      it('should snap to bottom', inject(function(dragging) {

        // when
        dragging.move(canvasEvent({ x: 150, y: 175 }));

        dragging.end();

        // then
        var boundaryEvent = getBoundaryEvent(task);

        expect(mid(boundaryEvent)).to.eql({
          x: 150,
          y: 180 // 175 snapped to 180
        });
      }));


      it('should snap to left', inject(function(dragging) {

        // when
        dragging.move(canvasEvent({ x: 95, y: 140 }));

        dragging.end();

        // then
        var boundaryEvent = getBoundaryEvent(task);

        expect(mid(boundaryEvent)).to.eql({
          x: 100, // 95 snapped to 100
          y: 140
        });
      }));

    });


    describe('snapping to boundary events', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.boundary-events.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      var task;

      beforeEach(inject(function(dragging, elementRegistry, move) {
        task = elementRegistry.get('Task_1');

        var process = elementRegistry.get('Process_1'),
            processGfx = elementRegistry.getGraphics(process);

        dragging.setOptions({ manual: true });

        move.start(canvasEventTopLeft({ x: 100, y: 400 }, task), task, true);

        dragging.hover({ element: process, gfx: processGfx });

        dragging.move(canvasEventTopLeft({ x: 100, y: 400 }, task));
      }));


      it('should snap to boundary events', inject(function(dragging) {

        // when
        dragging.move(canvasEventTopLeft({ x: 245, y: 400 }, task));

        dragging.end();

        // then
        expect(task).to.have.bounds({
          x: 250, // 245 snapped to 250
          y: 400,
          width: 100,
          height: 80
        });
      }));

    });

  });


  describe('sequence flows', function() {

    var diagramXML = require('./BpmnCreateMoveSnapping.sequence-flows.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var sequenceFlow, sequenceFlowGfx, task;

    beforeEach(inject(function(create, dragging, elementRegistry, elementFactory) {
      sequenceFlow = elementRegistry.get('SequenceFlow_1');
      sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow);

      task = elementFactory.createShape({
        type: 'bpmn:Task'
      });

      create.start(canvasEvent({ x: 0, y: 0 }), task);

      dragging.hover({ element: sequenceFlow, gfx: sequenceFlowGfx });

      dragging.setOptions({ manual: false });
    }));


    it('should add snap targets of sequence flow parent', inject(function(dragging) {

      // when
      dragging.move(canvasEventTopLeft({ x: 195, y: 60 }, task));

      dragging.end();

      // then
      expect(task).to.have.bounds({
        x: 200, // 195 snapped to 200
        y: 60,
        width: 100,
        height: 80
      });
    }));

  });


  describe('lanes', function() {

    var diagramXML = require('./BpmnCreateMoveSnapping.collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var task;

    beforeEach(inject(function(dragging, elementRegistry, move) {
      task = elementRegistry.get('Task_1');

      dragging.setOptions({ manual: false });

      move.start(canvasEvent({ x: 200, y: 165 }), task);
    }));


    it('should should NOT snap to lanes', inject(function(dragging) {

      // when
      // lane mid is { x: 415, y: 162.5 }
      dragging.move(canvasEvent({ x: 410, y: 160 }));

      dragging.end();

      // then
      expect(task).to.have.bounds({
        x: 360,
        y: 120,
        width: 100,
        height: 80
      });
    }));

  });

});

// helpers //////////

function canvasEventTopLeft(position, shape) {
  return canvasEvent({
    x: position.x + shape.width / 2,
    y: position.y + shape.height / 2
  });
}

function getBoundaryEvent(element) {
  return element.attachers[0];
}