'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var coreModule = require('../../../../lib/core'),
    snappingModule = require('../../../../lib/features/snapping'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create'),
    resizeModule = require('diagram-js/lib/features/resize'),
    moveModule = require('diagram-js/lib/features/move'),
    rulesModule = require('../../../../lib/features/rules');


describe('features/snapping - BpmnSnapping', function() {

  var testModules = [
    coreModule,
    snappingModule,
    modelingModule,
    createModule,
    rulesModule,
    moveModule
  ];


  describe('on Boundary Events', function() {

    var diagramXML = require('../../../fixtures/bpmn/collaboration/process.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var task, intermediateThrowEvent;

    beforeEach(inject(function(elementFactory, elementRegistry, dragging) {
      task = elementRegistry.get('Task_1');

      intermediateThrowEvent = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
      });

      dragging.setOptions({ manual: true });
    }));

    afterEach(inject(function(dragging) {
      dragging.setOptions({ manual: false });
    }));

    it('should snap on create to the bottom',
        inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var taskGfx = canvas.getGraphics(task);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

      dragging.hover({ element: task, gfx: taskGfx });

      dragging.move(canvasEvent({ x: 382, y: 170 }));
      dragging.end();

      var boundaryEvent = elementRegistry.get(task.attachers[0].id);

      // then
      expect(boundaryEvent).to.have.bounds({ x: 364, y: 167, width: 36, height: 36 });
    }));


    it('should snap on create to the left',
        inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var taskGfx = canvas.getGraphics(task);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

      dragging.hover({ element: task, gfx: taskGfx });

      dragging.move(canvasEvent({ x: 382, y: 115 }));
      dragging.end();

      var boundaryEvent = elementRegistry.get(task.attachers[0].id);

      // then
      expect(boundaryEvent).to.have.bounds({ x: 364, y: 87, width: 36, height: 36 });
    }));

  });


  describe('on Participant create', function() {

    describe('in non-empty process', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/process.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should snap to process children bounds / top left',
          inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 65, y: 65 }));
        dragging.end(canvasEvent({ x: 65, y: 65 }));

        // then
        expect(participantShape).to.have.bounds({
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
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 400, y: 400 }));
        dragging.end(canvasEvent({ x: 400, y: 400 }));

        // then
        expect(participantShape).to.have.bounds({
          width: 600, height: 250, x: 100, y: 52
        });
      }));

    });


    describe('in empty process', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/process-empty.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should not snap', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 400, y: 400 }));
        dragging.end(canvasEvent({ x: 400, y: 400 }));

        // then
        expect(participantShape).to.have.bounds({
          x: 100, y: 275, width: 600, height: 250
        });
      }));

    });


    describe('in collaboration', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/collaboration-participant.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should not snap', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 400, y: 400 }));
        dragging.end(canvasEvent({ x: 400, y: 400 }));

        // then
        expect(participantShape).to.have.bounds({
          x: 100, y: 275, width: 600, height: 250
        });
      }));

    });

  });


  describe('on Participant resize', function () {

    describe('snap min bounds', function() {

      var diagramXML = require('./BpmnSnapping.participant-resize.bpmn');

      var testResizeModules = [
        coreModule,
        resizeModule,
        modelingModule,
        rulesModule,
        snappingModule
      ];

      beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


      it('should snap to children from <se>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_2');

        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(482);
        expect(participant.height).to.equal(252);
      }));


      it('should snap to children from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_2');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(467);
        expect(participant.height).to.equal(287);
      }));


      it('should snap to min dimensions from <se>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_1');

        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(300);
        expect(participant.height).to.equal(60);
      }));


      it('should snap to min dimensions from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_1');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(300);
        expect(participant.height).to.equal(60);
      }));


      it('should snap to min dimensions + children from <se>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_3');

        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(305);

        // snap to children rather than min dimensions
        expect(participant.height).to.equal(143);
      }));


      it('should snap to min dimensions + children from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_3');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(353);
        expect(participant.height).to.equal(177);
      }));

    });


    describe('snap child lanes', function() {

      var diagramXML = require('./BpmnSnapping.lanes-resize.bpmn');

      var testResizeModules = [
        coreModule,
        resizeModule,
        modelingModule,
        rulesModule,
        snappingModule
      ];

      beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


      it('should snap to child lanes from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(563);
        expect(participant.height).to.equal(223);
      }));


      it('should snap to nested child lanes from <se>', inject(function(elementRegistry, resize, dragging) {

        var lane = elementRegistry.get('Lane_B_0');

        resize.activate(canvasEvent({ x: 0, y: 0 }), lane, 'se');
        dragging.move(canvasEvent({ x: -500, y: -500 }));
        dragging.end();

        expect(lane.width).to.equal(313);
        expect(lane.height).to.equal(122);
      }));

    });

  });


  describe('on SubProcess resize', function() {

    var diagramXML = require('./BpmnSnapping.subProcess-resize.bpmn');

    var testResizeModules = [
      coreModule,
      modelingModule,
      resizeModule,
      rulesModule,
      snappingModule
    ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


    it('should snap to minimum bounds', inject(function(elementRegistry, resize, dragging) {

      var subProcess = elementRegistry.get('SubProcess');

      resize.activate(canvasEvent({ x: 0, y: 0 }), subProcess, 'se');
      dragging.move(canvasEvent({ x: -400, y: -400 }));
      dragging.end();

      expect(subProcess.width).to.equal(140);
      expect(subProcess.height).to.equal(120);
    }));

  });


  describe('on TextAnnotation resize', function() {

    var diagramXML = require('./BpmnSnapping.textAnnotation-resize.bpmn');

    var testResizeModules = [
      coreModule,
      modelingModule,
      resizeModule,
      rulesModule,
      snappingModule
    ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


    it('should snap to minimum bounds', inject(function(elementRegistry, resize, dragging) {

      var textAnnotation = elementRegistry.get('TextAnnotation');

      resize.activate(canvasEvent({ x: 0, y: 0 }), textAnnotation, 'se');
      dragging.move(canvasEvent({ x: -400, y: -400 }));
      dragging.end();

      expect(textAnnotation.width).to.equal(50);
      expect(textAnnotation.height).to.equal(30);
    }));

  });

  describe('labels', function() {

    var diagramXML = require('./BpmnSnapping.labels.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should snap to start events', inject(function(canvas, elementRegistry, move, dragging) {

      var label = elementRegistry.get('StartEvent_1_label'),
          rootElement = canvas.getRootElement();

      var originalPosition = { x: label.x, y: label.y };

      move.start(canvasEvent({ x: label.x+2, y: label.y+2 }), label);

      dragging.hover({
        element: rootElement,
        gfx: elementRegistry.getGraphics(rootElement)
      });

      dragging.move(canvasEvent({ x: label.x+4, y: label.y+40 }));
      dragging.move(canvasEvent({ x: label.x+4, y: label.y+40 }));

      dragging.end();

      expect(label.x).to.equal(originalPosition.x);

    }));


    it('should snap to boundary events', inject(function(canvas, elementRegistry, move, dragging) {

      var label = elementRegistry.get('BoundaryEvent_1_label'),
          rootElement = canvas.getRootElement();

      var originalPosition = { x: label.x, y: label.y };

      move.start(canvasEvent({ x: label.x+2, y: label.y+2 }), label);

      dragging.hover({
        element: rootElement,
        gfx: elementRegistry.getGraphics(rootElement)
      });

      dragging.move(canvasEvent({ x: label.x+4, y: label.y+40 }));
      dragging.move(canvasEvent({ x: label.x+4, y: label.y+40 }));

      dragging.end();

      expect(label.x).to.equal(originalPosition.x);

    }));


    it('should snap to siblings', inject(function(canvas, elementRegistry, move, dragging) {

      var label = elementRegistry.get('BoundaryEvent_1_label'),
          rootElement = canvas.getRootElement();

      move.start(canvasEvent({ x: label.x+2, y: label.y+2 }), label);

      dragging.hover({
        element: rootElement,
        gfx: elementRegistry.getGraphics(rootElement)
      });

      dragging.move(canvasEvent({ x: label.x-23, y: label.y+40 }));
      dragging.move(canvasEvent({ x: label.x-23, y: label.y+40 }));

      dragging.end();

      expect(label.x).to.equal(161);

    }));

  });

});
