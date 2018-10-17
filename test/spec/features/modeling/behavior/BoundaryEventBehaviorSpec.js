import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - boundary event', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('./BoundaryEvent.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('implicitly removing boundary events', function() {

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

});