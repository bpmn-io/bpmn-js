import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';

import { createCanvasEvent as canvasEvent } from '../../../../util/MockEvents';


describe('features/modeling/behavior - create', function() {

  var testModules = [
    coreModule,
    createModule,
    moveModule,
    modelingModule
  ];

  var diagramXML = require('./CreateBehavior.participant.bpmn');

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

    it('should ensure hovering participant', inject(
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

    it('should ensure hovering participant', inject(
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