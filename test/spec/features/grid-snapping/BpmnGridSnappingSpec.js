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

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

import {
  isString,
  pick,
  assign
} from 'min-dash';

var LOW_PRIORITY = 500;


describe('features/grid-snapping', function() {

  describe('basics', function() {

    describe('create', function() {

      var diagramXML = require('./basic.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          createModule,
          gridSnappingModule,
          modelingModule,
          moveModule
        ]
      }));


      it('start event', inject(function(canvas, create, dragging, elementFactory, eventBus) {

        // given
        var rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        var startEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' });

        var events = recordEvents(eventBus, [
          'create.move',
          'create.end'
        ]);

        // when
        create.start(canvasEvent({ x: 100, y: 100 }), startEvent);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 106, y: 112 }));
        dragging.move(canvasEvent({ x: 112, y: 124 }));
        dragging.move(canvasEvent({ x: 118, y: 136 }));
        dragging.move(canvasEvent({ x: 124, y: 148 }));
        dragging.move(canvasEvent({ x: 130, y: 160 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 100, y: 100 }, // move (triggered on create.start thanks to autoActivate)
          { x: 110, y: 110 }, // move
          { x: 110, y: 120 }, // move
          { x: 120, y: 140 }, // move
          { x: 120, y: 150 }, // move
          { x: 130, y: 160 }, // move
          { x: 130, y: 160 } // end
        ]);

        // expect snapped
        expect(getMid(startEvent)).to.eql({
          x: 130,
          y: 160
        });
      }));

    });

  });


  describe('snap top-left on move', function() {

    var diagramXML = require('./BpmnGridSnapping.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        createModule,
        gridSnappingModule,
        modelingModule,
        moveModule,
        gridSnappingModule
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


  describe('auto resize <nwse> on toggle collapse', function() {

    var diagramXML = require('./BpmnGridSnapping.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        createModule,
        gridSnappingModule,
        modelingModule,
        moveModule,
        gridSnappingModule
      ]
    }));

    var participant,
        subProcess;

    beforeEach(inject(function(elementRegistry) {
      participant = elementRegistry.get('Participant_1');
      subProcess = elementRegistry.get('SubProcess_1');
    }));


    describe('collapsing', function() {

      it('participant (no auto resize)', inject(function(bpmnReplace) {

        // given
        var collapsedBounds = assign(
          getBounds(participant),
          { height: 60 }
        );

        // when
        var collapsedParticipant = bpmnReplace.replaceElement(participant,
          {
            type: 'bpmn:Participant',
            isExpanded: false
          }
        );

        // then
        expect(collapsedParticipant).to.have.bounds(collapsedBounds);
      }));


      it('sub process (no auto resize)', inject(function(bpmnReplace) {

        // given
        var mid = getMid(subProcess);

        // when
        var collapsedSubProcess = bpmnReplace.replaceElement(subProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: false
          }
        );

        // then
        expect(getMid(collapsedSubProcess)).to.eql(mid);
        expect(collapsedSubProcess).to.include({
          width: 100,
          height: 80
        });
      }));

    });


    describe('expanding', function() {

      it('participant (auto resize <nwse>)', inject(function(bpmnReplace) {

        // given
        var bounds = getBounds(participant);

        var collapsedParticipant = bpmnReplace.replaceElement(participant,
          {
            type: 'bpmn:Participant',
            isExpanded: false
          }
        );

        // when
        var expandedParticipant = bpmnReplace.replaceElement(collapsedParticipant,
          {
            type: 'bpmn:Participant',
            isExpanded: true
          }
        );

        // then
        expect(expandedParticipant).to.have.bounds(bounds);
      }));


      it('sub process (auto resize <nwse>)', inject(function(bpmnReplace) {

        // given
        var collapsedSubProcess = bpmnReplace.replaceElement(subProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: false
          }
        );

        // when
        var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: true
          }
        );

        // then
        expect(expandedSubProcess).to.include({
          x: 150,
          y: 120,
          width: 360,
          height: 210
        });
      }));

    });

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
 * @return {Object}
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

function getBounds(shape) {
  return pick(shape, [ 'x', 'y', 'width', 'height' ]);
}