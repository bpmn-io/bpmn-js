/* global sinon */

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - detach events', function() {

  var testModules = [ coreModule, modelingModule ];

  var processDiagramXML = require('test/spec/features/rules/BpmnRules.detaching.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


  describe('basics', function() {

    it('should execute on detach', inject(function(canvas, elementRegistry, modeling) {

      // given
      var eventId = 'BoundaryEvent',
          boundaryEvent = elementRegistry.get(eventId),
          root = canvas.getRootElement(),
          intermediateThrowEvent;

      var elements = [ boundaryEvent ];

      // when
      modeling.moveElements(elements, { x: 0, y: 100 }, root);

      // then
      intermediateThrowEvent = elementRegistry.get(eventId);

      expect(boundaryEvent.parent).to.not.exist;
      expect(intermediateThrowEvent).to.exist;
      expect(intermediateThrowEvent.type).to.equal('bpmn:IntermediateThrowEvent');
      expect(intermediateThrowEvent.businessObject.attachedToRef).to.not.exist;
      expect(intermediateThrowEvent.parent).to.equal(root);
    }));


    it('should NOT execute on move to another host', inject(function(elementRegistry, modeling) {

      // given
      var eventId = 'BoundaryEvent',
          boundaryEvent = elementRegistry.get(eventId),
          subProcess = elementRegistry.get('SubProcess_1');

      var elements = [ boundaryEvent ];

      // when
      modeling.moveElements(elements, { x: -20, y: 0 }, subProcess, { attach: true });

      // then
      expect(boundaryEvent.host).to.eql(subProcess);
      expect(boundaryEvent.type).to.equal('bpmn:BoundaryEvent');
      expect(boundaryEvent.businessObject.attachedToRef).to.equal(subProcess.businessObject);
    }));
  });


  describe('event definition', function() {

    it('should leave event definitions empty if not present',
      inject(function(canvas, elementRegistry, modeling) {

        // given
        var boundaryEvent = elementRegistry.get('BoundaryEvent'),
            root = canvas.getRootElement(),
            eventDefinitions = boundaryEvent.businessObject.eventDefinitions,
            intermediateEvent, bo;

        var elements = [ boundaryEvent ];

        // when
        modeling.moveElements(elements, { x: 0, y: 90 }, root);

        // then
        intermediateEvent = elementRegistry.get('BoundaryEvent');
        bo = intermediateEvent.businessObject;

        expect(intermediateEvent.type).to.equal('bpmn:IntermediateThrowEvent');
        expect(bo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);
      })
    );


    it('should copy event definitions', inject(function(canvas, elementRegistry, modeling) {

      // given
      var detachableEvents = [
        'BoundaryMessageEvent',
        'BoundaryTimerEvent',
        'BoundarySignalEvent',
        'BoundaryConditionalEvent'
      ];

      detachableEvents.forEach(function(eventId) {

        var boundaryEvent = elementRegistry.get(eventId),
            root = canvas.getRootElement(),
            eventDefinitions = boundaryEvent.businessObject.eventDefinitions,
            intermediateEvent, bo;

        var elements = [ boundaryEvent ];

        // when
        modeling.moveElements(elements, { x: 0, y: 90 }, root);

        // then
        intermediateEvent = elementRegistry.get(eventId);
        bo = intermediateEvent.businessObject;

        expect(intermediateEvent.type).to.equal('bpmn:IntermediateCatchEvent');
        expect(bo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);
      });
    }));
  });


  describe('connections', function() {

    var eventId = 'BoundaryEventWithConnections';

    it('should keep outgoing connection', inject(function(canvas, elementRegistry, modeling) {

      var event = elementRegistry.get(eventId),
          root = canvas.getRootElement(),
          task = elementRegistry.get('Task_1'),
          intermediateEvent;

      var elements = [ event ];

      // when
      modeling.moveElements(elements, { x: 0, y: 100 }, root);

      // then
      intermediateEvent = elementRegistry.get(eventId);

      expect(intermediateEvent.outgoing).to.have.lengthOf(1);
      expect(task.incoming).to.have.lengthOf(1);
    }));


    it('should lay out connection once',
      inject(function(eventBus, canvas, elementRegistry, modeling) {

        // given
        var layoutSpy = sinon.spy(),
            event = elementRegistry.get(eventId),
            root = canvas.getRootElement();

        eventBus.on('commandStack.connection.layout.execute', layoutSpy);

        var elements = [ event ];

        // when
        modeling.moveElements(elements, { x: 0, y: 100 }, root);

        // then
        expect(layoutSpy).to.be.calledOnce;
      })
    );
  });


  describe('labels', function() {

    var eventId = 'BoundaryEventWithLabel';

    it('should ignore label movement', inject(function(canvas, elementRegistry, modeling) {

      var event = elementRegistry.get(eventId),
          root = canvas.getRootElement(),
          initialElements = elementRegistry.getAll().slice();

      var elements = [ event.label ];

      // when
      modeling.moveElements(elements, { x: 0, y: 300 }, root);

      // then
      expect(elementRegistry.getAll()).to.eql(initialElements);
    }));
  });

});



// helper //////
function skipId(key, value) {

  if (key === 'id') {
    return;
  }

  return value;
}
