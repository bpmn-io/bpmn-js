'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    snappingModule = require('../../../../../lib/features/snapping'),
    createModule = require('diagram-js/lib/features/create'),
    coreModule = require('../../../../../lib/core');

var Events = require('diagram-js/test/util/Events');

describe('features/modeling - create boundary events', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('attach to rootShape', function () {

    var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process-empty.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules.concat(createModule, snappingModule) }));


    var createEvent;

    beforeEach(inject(function(dragging, canvas) {
      createEvent = Events.scopedCreate(canvas);

      dragging.setOptions({ manual: true });
    }));

    afterEach(inject(function(dragging) {
      dragging.setOptions({ manual: false });
    }));


    it('should morph an IntermediateThrowEvent to a BoundaryEvent -> Modeling',
      inject(function(elementFactory, modeling, canvas) {

      var rootShape = canvas.getRootElement(),
          task = elementFactory.createShape({ type: 'bpmn:Task' }),
          intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' }),
          boundaryEvent;

      // given
      modeling.createShape(task, { x: 100, y: 100 }, rootShape);

      // when
      modeling.createShape(intermediateEvent, { x: 150, y: 135 }, task, true);

      boundaryEvent = task.attachers[0];

      // then
      expect(boundaryEvent.type).to.equal('bpmn:BoundaryEvent');
      expect(boundaryEvent.businessObject.attachedToRef).to.equal(task.businessObject);
    }));


    it('should morph an IntermediateThrowEvent to a BoundaryEvent -> Create',
      inject(function(elementFactory, create, canvas, dragging, modeling, elementRegistry) {

      // given
      var rootShape = canvas.getRootElement(),
          task = elementFactory.createShape({ type: 'bpmn:Task' }),
          intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' }),
          boundaryEvent;

      modeling.createShape(task, { x: 100, y: 100 }, rootShape);

      // when
      create.start(createEvent({ x: 0, y: 0 }), intermediateEvent);

      dragging.hover({ element: task, gfx: elementRegistry.getGraphics(task) });
      dragging.move(createEvent({ x: 50 + 18, y: 100 }));

      dragging.end();

      boundaryEvent = task.attachers[0];

      // then
      expect(boundaryEvent.type).to.equal('bpmn:BoundaryEvent');
      expect(boundaryEvent.businessObject.attachedToRef).to.equal(task.businessObject);
    }));


    it('should NOT morph an IntermediateThrowEvent to a BoundaryEvent',
      inject(function(elementFactory, create, canvas, dragging, modeling, elementRegistry) {

      var rootShape = canvas.getRootElement(),
          subProcess = elementFactory.createShape({ type: 'bpmn:SubProcess', isExpanded: true }),
          intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' }),
          intermediateEventId = intermediateEvent.id;

      modeling.createShape(subProcess, { x: 300, y: 200 }, rootShape);

      create.start(createEvent({ x: 0, y: 0 }), intermediateEvent);

      dragging.hover({ element: subProcess, gfx: elementRegistry.getGraphics(subProcess) });

      dragging.move(createEvent({ x: 300, y: 200 }));
      dragging.end();

      intermediateEvent = elementRegistry.get(intermediateEventId);

      // then
      expect(intermediateEvent).to.exist;
      expect(intermediateEvent.type).to.equal('bpmn:IntermediateThrowEvent');
    }));

  });

});
