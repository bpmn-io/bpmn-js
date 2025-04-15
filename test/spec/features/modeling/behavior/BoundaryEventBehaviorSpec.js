import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import { is } from 'lib/util/ModelUtil';


describe('features/modeling/behavior - boundary event', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('./BoundaryEvent.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should implicitly remove boundary events', function() {

    it('after connecting to event-based gateway',
      inject(function(modeling, elementRegistry) {

        // given
        var eventBasedGateway = elementRegistry.get('EventBasedGateway_1'),
            receiveTask = elementRegistry.get('ReceiveTask_1'),
            boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        // when
        modeling.connect(eventBasedGateway, receiveTask, {
          type: 'bpmn:SequenceFlow'
        });

        // then
        expect(elementRegistry.get(boundaryEvent.id)).not.to.exist;
      })
    );


    it('after replacing connected gateway with event-based gateway',
      inject(function(modeling, elementRegistry, bpmnReplace) {

        // given
        var gateway = elementRegistry.get('ExclusiveGateway_1'),
            receiveTask = elementRegistry.get('ReceiveTask_1'),
            boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        modeling.connect(gateway, receiveTask, {
          type: 'bpmn:SequenceFlow'
        });

        // when
        bpmnReplace.replaceElement(gateway, {
          type: 'bpmn:EventBasedGateway'
        });

        // then
        expect(elementRegistry.get(boundaryEvent.id)).not.to.exist;
      })
    );

  });


  describe('should keep root element reference on replace', function() {

    describe('interrupting to non-interrupting', function() {

      it('message reference', inject(function(bpmnReplace, elementRegistry) {

        // given
        var interruptingBoundaryEvent = elementRegistry.get('BoundaryEvent_2'),
            message = getReferencedRootElement(interruptingBoundaryEvent, 'messageRef');

        // assume
        expect(is(message, 'bpmn:Message')).to.be.true;

        // when
        var nonInterruptingBoundaryEvent = bpmnReplace.replaceElement(interruptingBoundaryEvent, {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition',
          cancelActivity: false
        });

        // then
        expectRefEquals(interruptingBoundaryEvent, nonInterruptingBoundaryEvent, 'messageRef');
      }));


      it('escalation reference', inject(function(bpmnReplace, elementRegistry) {

        // given
        var interruptingBoundaryEvent = elementRegistry.get('BoundaryEvent_3'),
            escalation = getReferencedRootElement(interruptingBoundaryEvent, 'escalationRef');

        // assume
        expect(is(escalation, 'bpmn:Escalation')).to.be.true;

        // when
        var nonInterruptingBoundaryEvent = bpmnReplace.replaceElement(interruptingBoundaryEvent, {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:EscalationEventDefinition',
          cancelActivity: false
        });

        // then
        expectRefEquals(interruptingBoundaryEvent, nonInterruptingBoundaryEvent, 'escalationRef');
      }));


      it('error reference', inject(function(bpmnReplace, elementRegistry) {

        // given
        var interruptingBoundaryEvent = elementRegistry.get('BoundaryEvent_4'),
            error = getReferencedRootElement(interruptingBoundaryEvent, 'errorRef');

        // assume
        expect(is(error, 'bpmn:Error')).to.be.true;

        // when
        var nonInterruptingBoundaryEvent = bpmnReplace.replaceElement(interruptingBoundaryEvent, {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:ErrorEventDefinition',
          cancelActivity: false
        });

        // then
        expectRefEquals(interruptingBoundaryEvent, nonInterruptingBoundaryEvent, 'errorRef');
      }));


      it('signal reference', inject(function(bpmnReplace, elementRegistry) {

        // given
        var interruptingBoundaryEvent = elementRegistry.get('BoundaryEvent_5'),
            signal = getReferencedRootElement(interruptingBoundaryEvent, 'signalRef');

        // assume
        expect(is(signal, 'bpmn:Signal')).to.be.true;

        // when
        var nonInterruptingBoundaryEvent = bpmnReplace.replaceElement(interruptingBoundaryEvent, {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:SignalEventDefinition',
          cancelActivity: false
        });

        // then
        expectRefEquals(interruptingBoundaryEvent, nonInterruptingBoundaryEvent, 'signalRef');
      }));

    });


    describe('non-interrupting to interrupting', function() {

      it('message reference', inject(function(bpmnReplace, elementRegistry) {

        // given
        var interruptingBoundaryEvent = elementRegistry.get('BoundaryEvent_6'),
            message = getReferencedRootElement(interruptingBoundaryEvent, 'messageRef');

        // assume
        expect(is(message, 'bpmn:Message')).to.be.true;

        // when
        var nonInterruptingBoundaryEvent = bpmnReplace.replaceElement(interruptingBoundaryEvent, {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition',
          cancelActivity: true
        });

        // then
        expectRefEquals(interruptingBoundaryEvent, nonInterruptingBoundaryEvent, 'messageRef');
      }));

    });

  });

});


// helpers //////////

function getReferencedRootElement(element, propertyName) {
  var businessObject = element.businessObject,
      eventDefinition = businessObject.eventDefinitions[ 0 ];

  return eventDefinition.get(propertyName);
}

function expectRefEquals(element, newElement, propertyName) {
  const previousRefElement = getReferencedRootElement(element, propertyName);
  const newRefElement = getReferencedRootElement(newElement, propertyName);

  // expect name to be same
  expect(previousRefElement).to.equal(newRefElement);

}