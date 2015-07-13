'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var Events = require('diagram-js/test/util/Events');

var coreModule = require('../../../../lib/core'),
    snappingModule = require('../../../../lib/features/snapping'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create'),
    resizeModule = require('diagram-js/lib/features/resize'),
    moveModule = require('diagram-js/lib/features/move'),
    rulesModule = require('../../../../lib/features/modeling/rules');

var pick = require('lodash/object/pick');


function bounds(element) {
  return pick(element, [ 'width', 'height', 'x', 'y' ]);
}


describe('features/snapping - BpmnSnapping', function() {

  var testModules = [ coreModule, snappingModule, modelingModule, createModule, rulesModule, moveModule ];

  describe('on Boundary Events', function() {

    var diagramXML = require('../../../fixtures/bpmn/collaboration/process.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var task, intermediateThrowEvent, createEvent;

    beforeEach(inject(function(elementFactory, elementRegistry, canvas, dragging) {
      task = elementRegistry.get('Task_1');

      intermediateThrowEvent = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
      });

      dragging.setOptions({ manual: true });

      createEvent = Events.scopedCreate(canvas);
    }));

    afterEach(inject(function(dragging) {
      dragging.setOptions({ manual: false });
    }));

    it('should snap on create to the bottom',
        inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var taskGfx = canvas.getGraphics(task);

      // when
      create.start(createEvent({ x: 0, y: 0 }), intermediateThrowEvent);

      dragging.hover({ element: task, gfx: taskGfx });

      dragging.move(createEvent({ x: 382, y: 170 }));
      dragging.end();

      var boundaryEvent = elementRegistry.get(task.attachers[0].id);

      // then
      expect(bounds(boundaryEvent)).to.eql({ x: 364, y: 167, width: 36, height: 36 });
    }));


    it('should snap on create to the left',
        inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var taskGfx = canvas.getGraphics(task);

      // when
      create.start(createEvent({ x: 0, y: 0 }), intermediateThrowEvent);

      dragging.hover({ element: task, gfx: taskGfx });

      dragging.move(createEvent({ x: 382, y: 115 }));
      dragging.end();

      var boundaryEvent = elementRegistry.get(task.attachers[0].id);

      // then
      expect(bounds(boundaryEvent)).to.eql({ x: 364, y: 87, width: 36, height: 36 });
    }));

  });

  describe('on Participant create', function() {

    describe('in non-empty process', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/process.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      var createEvent;

      beforeEach(inject(function(canvas, dragging) {
        createEvent = Events.scopedCreate(canvas);
        dragging.setOptions({ manual: true });
      }));


      it('should snap to process children bounds / top left',
          inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(createEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(createEvent({ x: 65, y: 65 }));
        dragging.end(createEvent({ x: 65, y: 65 }));

        // then
        expect(bounds(participantShape)).to.eql({
          width: 600, height: 250, x: 18, y: -8
        });
      }));


      it('should snap to process children bounds / bottom right',
          inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(createEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(createEvent({ x: 400, y: 400 }));
        dragging.end(createEvent({ x: 400, y: 400 }));

        // then
        expect(bounds(participantShape)).to.eql({
          width: 600, height: 250, x: 100, y: 52
        });
      }));

    });


    describe('in empty process', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/process-empty.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      var createEvent;

      beforeEach(inject(function(canvas, dragging) {
        createEvent = Events.scopedCreate(canvas);
        dragging.setOptions({ manual: true });
      }));


      it('should not snap', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(createEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(createEvent({ x: 400, y: 400 }));
        dragging.end(createEvent({ x: 400, y: 400 }));

        // then
        expect(bounds(participantShape)).to.eql({
          x: 100, y: 275, width: 600, height: 250
        });
      }));

    });


    describe('in collaboration', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/collaboration-participant.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      var createEvent;

      beforeEach(inject(function(canvas, dragging) {
        createEvent = Events.scopedCreate(canvas);
        dragging.setOptions({ manual: true });
      }));


      it('should not snap', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(createEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(createEvent({ x: 400, y: 400 }));
        dragging.end(createEvent({ x: 400, y: 400 }));

        // then
        expect(bounds(participantShape)).to.eql({
          x: 100, y: 275, width: 600, height: 250
        });
      }));

    });

  });


  describe('on Participant resize', function () {

    var diagramXML = require('./BpmnSnapping.collaboration-resize.bpmn');

    var testResizeModules = [ coreModule, resizeModule, rulesModule, snappingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));

    var createEvent;

    beforeEach(inject(function(canvas, dragging) {
      createEvent = Events.scopedCreate(canvas);
    }));


    describe('snap min bounds', function() {

      it('should snap to children from <se>', inject(function(canvas, elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_2');

        resize.activate(createEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(createEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(497);
        expect(participant.height).to.equal(252);
      }));


      it('should snap to children from <nw>', inject(function(canvas, elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_2');

        resize.activate(createEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(createEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(467);
        expect(participant.height).to.equal(287);
      }));


      it('should snap to min dimensions from <se>', inject(function(canvas, elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_1');

        resize.activate(createEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(createEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(300);
        expect(participant.height).to.equal(150);
      }));


      it('should snap to min dimensions from <nw>', inject(function(canvas, elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_1');

        resize.activate(createEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(createEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(300);
        expect(participant.height).to.equal(150);
      }));


      it('should snap to min dimensions + children from <se>', inject(function(canvas, elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_3');

        resize.activate(createEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(createEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(320);
        expect(participant.height).to.equal(150);
      }));


      it('should snap to min dimensions + children from <nw>', inject(function(canvas, elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_3');

        resize.activate(createEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(createEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(353);
        expect(participant.height).to.equal(177);
      }));

    });


    it('should snap a SubProcess to minimum bounds', inject(function(canvas, elementRegistry, resize, dragging) {

      var subProcess = elementRegistry.get('SubProcess_1');

      resize.activate(createEvent({ x: 453, y: 624 }), subProcess, 'se');
      dragging.move(createEvent({ x: -453, y: -624 }));
      dragging.end();

      expect(subProcess.width).to.equal(140);
      expect(subProcess.height).to.equal(120);
    }));


    it('should snap a Participant to minimum bounds', inject(function(canvas, elementRegistry, resize, dragging) {

      var participant = elementRegistry.get('Participant_1');

      resize.activate(createEvent({ x: 614, y: 310 }), participant, 'se');
      dragging.move(createEvent({ x: -614, y: -310 }));
      dragging.end();

      expect(participant.width).to.equal(300);
      expect(participant.height).to.equal(150);
    }));


    it('should snap a TextAnnotation to minimum bounds', inject(function(canvas, elementRegistry, resize, dragging) {

      var textAnnotation = elementRegistry.get('TextAnnotation_1');

      resize.activate(createEvent({ x: 592, y: 452 }), textAnnotation, 'se');
      dragging.move(createEvent({ x: -592, y: -452 }));
      dragging.end();

      expect(textAnnotation.width).to.equal(50);
      expect(textAnnotation.height).to.equal(50);
    }));

  });

});
