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


  describe('when replacing gateway with event-based gateway', function() {

    beforeEach(bootstrapModeler(
      diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          replaceModule
        ]
      }
    ));


    it('should remove duplicate connections to the same target',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var gateway = elementRegistry.get('ExclusiveGateway_C'),
            receiveTask = elementRegistry.get('ReceiveTask_D');

        // assume
        expect(gateway.outgoing).to.have.length(2);
        expect(receiveTask.incoming).to.have.length(2);

        // when
        var newGateway = bpmnReplace.replaceElement(gateway, {
          type: 'bpmn:EventBasedGateway'
        });

        // then
        expect(newGateway.outgoing).to.have.length(1);
        expect(newGateway.outgoing[0].target).to.equal(receiveTask);
        expect(receiveTask.incoming).to.have.length(1);
      })
    );


    it('should undo removal of duplicate connections',
      inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var gateway = elementRegistry.get('ExclusiveGateway_C'),
            receiveTask = elementRegistry.get('ReceiveTask_D');

        bpmnReplace.replaceElement(gateway, {
          type: 'bpmn:EventBasedGateway'
        });

        // when
        commandStack.undo();

        // then
        gateway = elementRegistry.get('ExclusiveGateway_C');
        expect(gateway.outgoing).to.have.length(2);
        expect(receiveTask.incoming).to.have.length(2);
      })
    );

  });

});
