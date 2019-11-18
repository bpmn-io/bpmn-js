import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  getBusinessObject,
  is
} from '../../../../lib/util/ModelUtil';


describe('features - element factory', function() {

  var diagramXML = require('./ElementFactory.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('create', function() {

    it('should create with message event definition', inject(function(elementFactory) {

      // when
      var intermediateThrowEvent = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });

      // then
      expect(intermediateThrowEvent).to.exist;
      expect(is(intermediateThrowEvent, 'bpmn:IntermediateThrowEvent')).to.be.true;

      var intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent),
          eventDefinitions = intermediateThrowEventBo.eventDefinitions;

      expect(eventDefinitions).to.exist;
      expect(eventDefinitions).to.have.length(1);

      var messageEventDefinition = eventDefinitions[ 0 ];

      expect(is(messageEventDefinition, 'bpmn:MessageEventDefinition')).to.be.true;
    }));


    it('should create event with conditional event definition', inject(function(elementFactory) {

      // when
      var intermediateCatchEvent = elementFactory.createShape({
        type: 'bpmn:IntermediateCatchEvent',
        eventDefinitionType: 'bpmn:ConditionalEventDefinition'
      });

      // then
      expect(intermediateCatchEvent).to.exist;
      expect(is(intermediateCatchEvent, 'bpmn:IntermediateCatchEvent')).to.be.true;

      var intermediateThrowEventBo = getBusinessObject(intermediateCatchEvent),
          eventDefinitions = intermediateThrowEventBo.eventDefinitions;

      expect(eventDefinitions).to.exist;
      expect(eventDefinitions).to.have.length(1);

      var conditionalEventDefinition = eventDefinitions[ 0 ];

      expect(is(conditionalEventDefinition, 'bpmn:ConditionalEventDefinition')).to.be.true;
      expect(conditionalEventDefinition.condition).to.exist;
      expect(is(conditionalEventDefinition.condition, 'bpmn:FormalExpression')).to.be.true;
    }));


    describe('integration', function() {

      it('should create event definition with ID', inject(function(elementFactory) {

        // when
        var intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        });

        // then
        var intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent),
            eventDefinitions = intermediateThrowEventBo.eventDefinitions,
            messageEventDefinition = eventDefinitions[ 0 ];

        expect(messageEventDefinition.id).to.exist;
      }));


      it('should create formal expression with ID', inject(function(elementFactory) {

        // when
        var intermediateCatchEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateCatchEvent',
          eventDefinitionType: 'bpmn:ConditionalEventDefinition'
        });

        // then
        var intermediateThrowEventBo = getBusinessObject(intermediateCatchEvent),
            eventDefinitions = intermediateThrowEventBo.eventDefinitions,
            conditionalEventDefinition = eventDefinitions[ 0 ];

        expect(conditionalEventDefinition.condition.id).not.to.exist;
      }));

    });

  });

});
