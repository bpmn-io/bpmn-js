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

import {
  assign
} from 'min-dash';


describe('features - element factory', function() {

  var diagramXML = require('./ElementFactory.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('basics', function() {

    it('should not mutate attrs', inject(function(elementFactory) {

      // given
      var attrs = {
        type: 'bpmn:SubProcess',
        isExpanded: false
      };

      // when
      var createAttrs = assign({}, attrs);

      elementFactory.createShape(createAttrs);

      // then
      expect(createAttrs).to.eql(attrs);
    }));


    it('should not mutate <di> attr', inject(function(elementFactory) {

      // given
      var attrs = {
        type: 'bpmn:SubProcess',
        isExpanded: false,
        di: {
          'bioc:stroke': 'red'
        }
      };

      // when
      var createAttrs = assign({}, attrs);

      elementFactory.createShape(createAttrs);

      // then
      expect(createAttrs).to.eql(attrs);
    }));

  });


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


    it('should create with link event definition', inject(function(elementFactory) {

      // when
      var intermediateThrowEvent = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        eventDefinitionType: 'bpmn:LinkEventDefinition',
        eventDefinitionAttrs: {
          name: ''
        }
      });

      // then
      expect(intermediateThrowEvent).to.exist;
      expect(is(intermediateThrowEvent, 'bpmn:IntermediateThrowEvent')).to.be.true;

      var intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent),
          eventDefinitions = intermediateThrowEventBo.eventDefinitions;

      expect(eventDefinitions).to.exist;
      expect(eventDefinitions).to.have.length(1);

      var eventDefinition = eventDefinitions[ 0 ];

      expect(is(eventDefinition, 'bpmn:LinkEventDefinition')).to.be.true;
      expect(eventDefinition.name).to.eql('');
    }));


    it('should error when accessing <di> via businessObject', inject(function(elementFactory) {

      // given
      var shape = elementFactory.createShape({
        type: 'bpmn:Task',
      });

      // then
      expect(shape.di).to.exist;
      expect(function() {
        shape.businessObject.di;
      }).to.throw(/The di is available through the diagram element only./);
    }));


    it('should add collapsed attribute to subprocess', inject(function(elementFactory) {

      // when
      var subprocess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: false
      });

      // then
      expect(subprocess.collapsed).to.be.true;
    }));


    it('should create subprocess as event subprocess', inject(function(elementFactory) {

      // when
      var subprocess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        triggeredByEvent: true
      });

      var businessObject = getBusinessObject(subprocess);

      // then
      expect(businessObject.triggeredByEvent).to.be.true;
    }));


    it('should create boundary event as non-interrupting', inject(function(elementFactory) {

      // when
      var event = elementFactory.createShape({
        type: 'bpmn:BoundaryEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition',
        cancelActivity: false
      });

      var businessObject = getBusinessObject(event);

      // then
      expect(businessObject.cancelActivity).to.be.false;
    }));


    it('should create exclusive gateway with x marker', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createShape({
        type: 'bpmn:ExclusiveGateway',
        di: { isMarkerVisible: true }
      });

      // then
      expect(shape.di.isMarkerVisible).to.be.true;
    }));


    it('should create exclusive gateway without x marker', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createShape({
        type: 'bpmn:ExclusiveGateway',
        di: { isMarkerVisible: false }
      });

      // then
      expect(shape.di.isMarkerVisible).to.be.false;
    }));


    it('should create exclusive gateway with x marker by default', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createShape({
        type: 'bpmn:ExclusiveGateway'
      });

      // then
      expect(shape.di.isMarkerVisible).to.be.true;
    }));


    it('should create horizontal participant', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createParticipantShape({
        isHorizontal: true
      });

      // then
      expect(shape.di.isHorizontal).to.be.true;
    }));


    it('should create vertical participant', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createParticipantShape({
        isHorizontal: false
      });

      // then
      expect(shape.di.isHorizontal).to.be.false;
    }));


    it('should create horizontal lane', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createShape({
        type: 'bpmn:Lane',
        isHorizontal: true
      });

      // then
      expect(shape.di.isHorizontal).to.be.true;
    }));


    it('should create vertical lane', inject(function(elementFactory) {

      // when
      var shape = elementFactory.createShape({
        type: 'bpmn:Lane',
        isHorizontal: false
      });

      // then
      expect(shape.di.isHorizontal).to.be.false;
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


      it('should NOT create formal expression with ID', inject(function(elementFactory) {

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
