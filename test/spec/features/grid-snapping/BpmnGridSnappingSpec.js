import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import { isString } from 'min-dash';

var LOW_PRIORITY = 500;


describe('features/grid-snapping', function() {

  var diagramXML = require('./BpmnGridSnapping.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      createModule,
      gridSnappingModule,
      modelingModule,
      moveModule
    ]
  }));

  var participant,
      subProcess,
      textAnnotation;

  beforeEach(inject(function(elementRegistry) {
    participant = elementRegistry.get('Participant_1');
    subProcess = elementRegistry.get('SubProcess_1');
    textAnnotation = elementRegistry.get('TextAnnotation_1');
  }));


  describe('snap top-left', function() {

    it('participant', inject(function(dragging, eventBus, move) {

      // given
      var events = recordEvents(eventBus, [
        'shape.move.move',
        'shape.move.end'
      ]);

      // when
      move.start(canvasEvent({ x: 100, y: 100 }), participant);

      dragging.move(canvasEvent({ x: 106, y: 112 }));
      dragging.move(canvasEvent({ x: 112, y: 124 }));
      dragging.move(canvasEvent({ x: 118, y: 136 }));
      dragging.move(canvasEvent({ x: 124, y: 148 }));
      dragging.move(canvasEvent({ x: 130, y: 160 }));

      dragging.end();

      // then
      expect(events.map(position('top-left'))).to.eql([
        { x: 110, y: 110 }, // move
        { x: 110, y: 120 }, // move
        { x: 120, y: 140 }, // move
        { x: 120, y: 150 }, // move
        { x: 130, y: 160 }, // move
        { x: 130, y: 160 } // end
      ]);

      // expect snapped to top-left
      expect(participant.x).to.equal(130);
      expect(participant.y).to.equal(160);
    }));


    it('sub process', inject(function(dragging, eventBus, move) {

      // given
      var events = recordEvents(eventBus, [
        'shape.move.move',
        'shape.move.end'
      ]);

      // when
      move.start(canvasEvent({ x: 150, y: 130 }), subProcess);

      dragging.move(canvasEvent({ x: 156, y: 142 }));
      dragging.move(canvasEvent({ x: 162, y: 154 }));
      dragging.move(canvasEvent({ x: 168, y: 166 }));
      dragging.move(canvasEvent({ x: 174, y: 178 }));
      dragging.move(canvasEvent({ x: 180, y: 190 }));

      dragging.end();

      // then
      expect(events.map(position('top-left'))).to.eql([
        { x: 160, y: 140 }, // move
        { x: 160, y: 150 }, // move
        { x: 170, y: 170 }, // move
        { x: 170, y: 180 }, // move
        { x: 180, y: 190 }, // move
        { x: 180, y: 190 } // end
      ]);

      // expect snapped to top-left
      expect(subProcess.x).to.equal(180);
      expect(subProcess.y).to.equal(190);
    }));


    it('text annotation', inject(function(dragging, eventBus, move) {

      // given
      var events = recordEvents(eventBus, [
        'shape.move.move',
        'shape.move.end'
      ]);

      // when
      move.start(canvasEvent({ x: 700, y: 20 }), textAnnotation);

      dragging.move(canvasEvent({ x: 706, y: 32 }));
      dragging.move(canvasEvent({ x: 712, y: 44 }));
      dragging.move(canvasEvent({ x: 718, y: 56 }));
      dragging.move(canvasEvent({ x: 724, y: 68 }));
      dragging.move(canvasEvent({ x: 730, y: 80 }));

      dragging.end();

      // then
      expect(events.map(position('top-left'))).to.eql([
        { x: 710, y: 30 }, // move
        { x: 710, y: 40 }, // move
        { x: 720, y: 60 }, // move
        { x: 720, y: 70 }, // move
        { x: 730, y: 80 }, // move
        { x: 730, y: 80 } // end
      ]);

      // expect snapped to top-left
      expect(textAnnotation.x).to.equal(730);
      expect(textAnnotation.y).to.equal(80);
    }));

  });

});

// helpers //////////

function recordEvents(eventBus, eventTypes) {
  var events = [];

  eventTypes.forEach(function(eventType) {
    eventBus.on(eventType, LOW_PRIORITY, function(event) {
      events.push(event);
    });
  });

  return events;
}

/**
 * Returns x and y of an event. If called with string that specifies orientation if will return
 * x and y of specified orientation.
 *
 * @param {Object|string} event - Event or orientation <top|right|bottom|left>
 *
 * @returns {Object}
 */
function position(event) {
  var orientation;

  if (isString(event)) {
    orientation = event;

    return function(event) {
      var shape = event.shape;

      var x = event.x,
          y = event.y;

      if (/top/.test(orientation)) {
        y -= shape.height / 2;
      }

      if (/right/.test(orientation)) {
        x += shape.width / 2;
      }

      if (/bottom/.test(orientation)) {
        y += shape.height / 2;
      }

      if (/left/.test(orientation)) {
        x -= shape.width / 2;
      }

      return {
        x: x,
        y: y
      };
    };
  }

  return {
    x: event.x,
    y: event.y
  };
}