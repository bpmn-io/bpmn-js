import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';

describe('features/modeling/behavior - event-based gateway', function() {

  var diagramXML = require('./EventBasedGatewayBehavior.bpmn');

  describe('when connecting from event-based gateway', function() {

    beforeEach(bootstrapModeler(
      diagramXML, {
        modules: [
          coreModule,
          modelingModule
        ]
      }
    ));


    it('should remove single existing sequence flow', inject(
      function(elementRegistry, modeling) {

        // given
        var eventBasedGateway = elementRegistry.get('EventBasedGateway_A'),
            intermediateEvent = elementRegistry.get('IntermediateCatchEvent'),
            existingConnection = elementRegistry.get('SequenceFlow_Existing'),
            newConnection;

        // when
        newConnection = modeling.connect(eventBasedGateway, intermediateEvent, {
          type: 'bpmn:SequenceFlow'
        });

        // then
        expect(elementRegistry.get(existingConnection.id)).not.to.exist;
        expect(elementRegistry.get(newConnection.id)).to.exist;
      }
    ));


    it('should remove multiple existing sequence flows', inject(
      function(elementRegistry, modeling) {

        // given
        var eventBasedGateway = elementRegistry.get('EventBasedGateway_C'),
            receiveTask = elementRegistry.get('ReceiveTask_A'),
            existingSequenceFlowA = elementRegistry.get('SequenceFlow_ExistingA'),
            existingSequenceFlowB = elementRegistry.get('SequenceFlow_ExistingB'),
            existingMessageFlow = elementRegistry.get('MessageFlow_Existing'),
            newSequenceFlow;

        // when
        newSequenceFlow = modeling.connect(eventBasedGateway, receiveTask, {
          type: 'bpmn:SequenceFlow'
        });

        // then
        expect(elementRegistry.get(existingSequenceFlowA.id)).to.not.exist;
        expect(elementRegistry.get(existingSequenceFlowB.id)).to.not.exist;
        expect(elementRegistry.get(existingMessageFlow.id)).to.exist;
        expect(elementRegistry.get(newSequenceFlow.id)).to.exist;
      }
    ));

  });


  describe('when replacing with event-based gateway', function() {

    beforeEach(bootstrapModeler(
      diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          replaceModule
        ]
      }
    ));


    it('should remove non-event-based incoming sequence flows of event-based targets',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var gatewayA = elementRegistry.get('ExclusiveGateway_B'),
            receiveTaskA = elementRegistry.get('ReceiveTask_B'),
            receiveTaskB = elementRegistry.get('ReceiveTask_C');

        // when
        bpmnReplace.replaceElement(gatewayA, { type: 'bpmn:EventBasedGateway' });

        // then
        expect(elementRegistry.get('SequenceFlow_A')).to.exist;
        expect(receiveTaskA.incoming.length).to.equal(1);

        expect(elementRegistry.get('SequenceFlow_B')).to.exist;
        expect(receiveTaskB.incoming.length).to.equal(1);
      })
    );

  });


  describe('when replacing with event-based gateway', function() {

    beforeEach(bootstrapModeler(
      diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          replaceModule
        ]
      }
    ));


    it('should remove outgoing sequence flows to non-event-based targets',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var gateway = elementRegistry.get('ExclusiveGateway_C');

        // when
        var newGateway = bpmnReplace.replaceElement(gateway, {
          type: 'bpmn:EventBasedGateway'
        });

        // then
        // only the connection to ReceiveTask (event-based target) should remain
        expect(newGateway.outgoing).to.have.length(1);
        expect(newGateway.outgoing[0].target.id).to.equal('ReceiveTask_C3');

        // connections to non-event-based targets should be removed
        expect(elementRegistry.get('SequenceFlow_C1')).not.to.exist;
        expect(elementRegistry.get('SequenceFlow_C2')).not.to.exist;
        expect(elementRegistry.get('SequenceFlow_C3')).to.exist;
      })
    );


    it('should remove outgoing sequence flows to event-based targets that have other non-event-based incoming',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        // ExclusiveGateway_B has outgoing to ReceiveTask_B and ReceiveTask_C
        // which also have incoming from other non-event-based sources
        var gateway = elementRegistry.get('ExclusiveGateway_B');

        // when
        var newGateway = bpmnReplace.replaceElement(gateway, {
          type: 'bpmn:EventBasedGateway'
        });

        // then
        // outgoing connections to event-based targets should be kept
        expect(newGateway.outgoing).to.have.length(2);

        // non-event-based incoming connections to targets should be removed
        var receiveTaskB = elementRegistry.get('ReceiveTask_B');
        var receiveTaskC = elementRegistry.get('ReceiveTask_C');

        expect(receiveTaskB.incoming).to.have.length(1);
        expect(receiveTaskB.incoming[0].source).to.equal(newGateway);
        expect(receiveTaskC.incoming).to.have.length(1);
        expect(receiveTaskC.incoming[0].source).to.equal(newGateway);
      })
    );

  });


  describe('when replacing event-based gateway with another gateway', function() {

    beforeEach(bootstrapModeler(
      diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          replaceModule
        ]
      }
    ));


    it('should keep outgoing sequence flows when replacing with inclusive gateway',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var gateway = elementRegistry.get('EventBasedGateway_B');
        var target1 = elementRegistry.get('IntermediateCatchEvent');
        var target2 = elementRegistry.get('IntermediateCatchEvent_1cagdda');

        // when
        var newGateway = bpmnReplace.replaceElement(gateway, {
          type: 'bpmn:InclusiveGateway'
        });

        // then
        expect(newGateway.outgoing).to.have.length(2);
        expect(target1.incoming).to.have.length(1);
        expect(target2.incoming).to.have.length(1);
      })
    );

  });

});
