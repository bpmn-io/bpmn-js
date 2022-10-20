import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';

describe('features/modeling/behavior - event-based gateway', function() {

  var diagramXML = require('./EventBasedGatewayBehavior.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    replaceModule
  ];


  describe('create connection', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('event-based gateway to receive task', inject(
      function(elementRegistry, modeling) {

        // given
        var eventBasedGateway = elementRegistry.get('EventBasedGateway_1'),
            receiveTask = elementRegistry.get('ReceiveTask_1');

        // assume
        expect(receiveTask.incoming).to.have.length(1);

        // when
        var connection = modeling.connect(eventBasedGateway, receiveTask, {
          type: 'bpmn:SequenceFlow'
        });

        // then
        expect(receiveTask.incoming).to.have.length(1);
        expect(receiveTask.incoming[ 0 ]).to.equal(connection);
      }
    ));


    it('event-based gateway to receive task (duplicate connection)', inject(
      function(elementRegistry, modeling) {

        // given
        var eventBasedGateway = elementRegistry.get('EventBasedGateway_1'),
            receiveTask = elementRegistry.get('ReceiveTask_2');

        // assume
        expect(receiveTask.incoming).to.have.length(1);

        // when
        var connection = modeling.connect(eventBasedGateway, receiveTask, {
          type: 'bpmn:SequenceFlow'
        });

        // then
        expect(receiveTask.incoming).to.have.length(1);
        expect(receiveTask.incoming[ 0 ]).to.equal(connection);
      }
    ));


    it('exclusive gateway to receive task', inject(
      function(elementRegistry, modeling) {

        // given
        var eventBasedGateway = elementRegistry.get('ExclusiveGateway_1'),
            receiveTask = elementRegistry.get('ReceiveTask_2');

        // assume
        expect(receiveTask.incoming).to.have.length(1);

        // when
        var connection = modeling.connect(eventBasedGateway, receiveTask, {
          type: 'bpmn:SequenceFlow'
        });

        // then
        expect(receiveTask.incoming).to.have.length(1);
        expect(receiveTask.incoming[ 0 ]).to.equal(connection);
      }
    ));

  });


  describe('replace shape', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('exclusive gateway with event-based gateway', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        var exclusiveGateway = elementRegistry.get('ExclusiveGateway_3'),
            receiveTask = elementRegistry.get('ReceiveTask_3');

        // assume
        expect(exclusiveGateway.outgoing).to.have.length(2);
        expect(receiveTask.incoming).to.have.length(3);

        // when
        var eventBasedGateway = bpmnReplace.replaceElement(exclusiveGateway, {
          type: 'bpmn:EventBasedGateway'
        });

        // then
        expect(eventBasedGateway.outgoing).to.have.length(1);
        expect(receiveTask.incoming).to.have.length(1);
      }
    ));


    it('event-based gateway with exclusive gateway', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        var eventBasedGateway = elementRegistry.get('EventBasedGateway_1');

        // assume
        expect(eventBasedGateway.outgoing).to.have.length(1);

        // when
        var exclusiveGateway = bpmnReplace.replaceElement(eventBasedGateway, {
          type: 'bpmn:ExclusiveGateway'
        });

        // then
        expect(exclusiveGateway.outgoing).to.have.length(1);
      }
    ));

  });

});
