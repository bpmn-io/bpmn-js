import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';


describe('features/modeling - non interrupting behavior', function() {

  const testModules = [ coreModule, modelingModule ];

  const processDiagramXML = require('./NonInterruptingBehavior.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

  let event;

  describe('start events', function() {

    describe('interrupting', function() {

      beforeEach(inject(function(elementRegistry) {
        event = elementRegistry.get('StartEvent_interrupting');
      }));


      it('should stay interrupting when replacing',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
          });

          // then
          expect(newEvent.businessObject.isInterrupting).to.be.true;
        })
      );


      it('should become non-interrupting when explicitly replacing with non-interrupting event',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition',
            isInterrupting: false
          });

          // then
          expect(newEvent.businessObject.isInterrupting).to.be.false;
        })
      );

    });


    describe('non-interrupting', function() {

      beforeEach(inject(function(elementRegistry) {
        event = elementRegistry.get('StartEvent_nonInterrupting');
      }));


      it('should stay non-interrupting when replacing',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
          });

          // then
          expect(newEvent.businessObject.isInterrupting).to.be.false;
        })
      );


      it('should become interrupting when explicitly replacing with interrupting event',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition',
            isInterrupting: true
          });

          // then
          expect(newEvent.businessObject.isInterrupting).to.be.true;
        })
      );


      it('should become interrupting when replacing with interrupting event type',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:ErrorEventDefinition'
          });

          // then
          expect(newEvent.businessObject.isInterrupting).to.be.true;
        })
      );

    });

  });


  describe('boundary events', function() {

    describe('interrupting', function() {

      beforeEach(inject(function(elementRegistry) {
        event = elementRegistry.get('BoundaryEvent_interrupting');
      }));


      it('should stay interrupting when replacing',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
          });

          // then
          expect(newEvent.businessObject.cancelActivity).to.be.true;
        })
      );


      it('should become non-interrupting when explicitly replacing with non-interrupting event',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition',
            cancelActivity: false
          });

          // then
          expect(newEvent.businessObject.cancelActivity).to.be.false;
        })
      );

    });


    describe('non-interrupting', function() {

      beforeEach(inject(function(elementRegistry) {
        event = elementRegistry.get('BoundaryEvent_nonInterrupting');
      }));


      it('should stay non-interrupting when replacing',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
          });

          // then
          expect(newEvent.businessObject.cancelActivity).to.be.false;
        })
      );


      it('should become interrupting when explicitly replacing with interrupting event',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition',
            cancelActivity: true
          });

          // then
          expect(newEvent.businessObject.cancelActivity).to.be.true;
        })
      );


      it('should become interrupting when replacing with interrupting event type',
        inject(function(bpmnReplace) {

          // when
          const newEvent = bpmnReplace.replaceElement(event, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:ErrorEventDefinition'
          });

          // then
          expect(newEvent.businessObject.cancelActivity).to.be.true;
        })
      );

    });

  });

});