import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  find
} from 'min-dash';

import {
  is,
  getBusinessObject
} from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - create message flow behavior ', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('connect to intermediate throw event', function() {

    var processDiagramXML = require('./CreateMessageFlowBehavior.bpmn');

    var task1, intermediateThrowEvent;

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry) {
      task1 = elementRegistry.get('Task_1');
      intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1');
    }));


    describe('events', function() {

      it('on <connect.end>',
        inject(function(elementRegistry, eventBus) {

          // given
          eventBus.on('connect.end', 500, function(event) {
            var context = event.context,
                target = context.target;

            var intermediateCatchEvent = elementRegistry.get(intermediateThrowEvent.id);

            expect(target).to.equal(intermediateCatchEvent);
          });

          console.clear();

          // when
          eventBus.fire('connect.end', {
            context: {
              source: task1,
              target: intermediateThrowEvent
            }
          });

          // then
          var intermediateCatchEvent = elementRegistry.get(intermediateThrowEvent.id);

          expect(hasMessageEventDefinition(intermediateCatchEvent)).to.be.true;

          expect(elementsConnected(task1, intermediateCatchEvent)).to.be.true;
        })
      );

    });


    describe('commands', function() {

      var intermediateCatchEvent,
          messageFlow,
          task2;

      beforeEach(inject(function(elementRegistry) {
        intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_1'),
        messageFlow = elementRegistry.get('MessageFlow_1');
        task2 = elementRegistry.get('Task_2');
      }));


      it('on <commandStack.connection.create>',
        inject(function(elementRegistry, modeling) {

          // when
          modeling.connect(task1, intermediateThrowEvent);

          // then
          intermediateCatchEvent = elementRegistry.get(intermediateThrowEvent.id);

          expect(hasMessageEventDefinition(intermediateCatchEvent)).to.be.true;

          expect(elementsConnected(task1, intermediateCatchEvent)).to.be.true;
        })
      );


      it('on <commandStack.connection.reconnectEnd>',
        inject(function(elementRegistry, modeling) {

          // when
          modeling.reconnectEnd(messageFlow, intermediateThrowEvent, {
            x: 250,
            y: 468
          });

          // then
          intermediateCatchEvent = elementRegistry.get(intermediateThrowEvent.id);

          expect(hasMessageEventDefinition(intermediateCatchEvent)).to.be.true;

          expect(elementsConnected(task2, intermediateCatchEvent)).to.be.true;
        })
      );

    });

  });

});

// helper //////////

function hasMessageEventDefinition(element) {
  var businessObject = getBusinessObject(element),
      eventDefinitions = businessObject.eventDefinitions || [];

  return !!find(eventDefinitions, function(definition) {
    return is(definition, 'bpmn:MessageEventDefinition');
  });
}

function elementsConnected(source, target) {
  return !!find(source.outgoing, function(outgoing) {
    return outgoing.target === target;
  });
}