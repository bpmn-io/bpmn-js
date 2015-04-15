'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var Events = require('diagram-js/test/util/Events');

var coreModule = require('../../../../lib/core'),
    snappingModule = require('../../../../lib/features/snapping'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create'),
    rulesModule = require('../../../../lib/features/modeling/rules');

var pick = require('lodash/object/pick');


function bounds(element) {
  return pick(element, [ 'width', 'height', 'x', 'y' ]);
}


describe('features/snapping - BpmnSnapping', function() {

  var testModules = [ coreModule, snappingModule, modelingModule, createModule, rulesModule ];


  describe('when dropping on non-empty process', function() {

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
      expect(bounds(participantShape)).toEqual({
        width: 600, height: 300, x: 18, y: -58
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
      expect(bounds(participantShape)).toEqual({
        width: 600, height: 300, x: 100, y: 52
      });
    }));

  });


  describe('when dropping on empty process', function() {

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
      expect(bounds(participantShape)).toEqual({
        width: 600, height: 300, x: 100, y: 250
      });
    }));

  });


  describe('when dropping on collaboration', function() {

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
      expect(bounds(participantShape)).toEqual({
        width: 600, height: 300, x: 100, y: 250
      });
    }));

  });

});