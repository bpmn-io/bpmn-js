import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';

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
        participant;

    beforeEach(inject(function(elementRegistry) {
      participant = elementRegistry.get('Participant_1');

      lane = elementRegistry.get('Lane_1');
      laneGfx = elementRegistry.getGraphics(lane);
    }));


    describe('create', function() {

      it('should set participant as hover element', inject(
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

    });


    describe('move', function() {

      it('should set participant as hover element', inject(
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

      it('should set root as hover element', inject(
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

      it('should set root as hover element', inject(
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

      it('should set root as hover element', inject(
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

});