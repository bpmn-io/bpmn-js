import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';

import { is, getDi } from 'lib/util/ModelUtil';

describe('features/modeling/behavior - subprocess start event', function() {

  var diagramXML = require('./SubProcessBehavior.start-event.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      replaceModule
    ]
  }));


  describe('replace', function() {

    describe('task -> expanded subprocess', function() {

      it('should add start event child to subprocess', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var task = elementRegistry.get('Task_1'),
              expandedSubProcess,
              startEvents;

          // when
          expandedSubProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          startEvents = getChildStartEvents(expandedSubProcess);

          expect(startEvents).to.have.length(1);
        }
      ));


      it('should wire startEvent di correctly', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var task = elementRegistry.get('Task_1'),
              expandedSubProcess,
              startEvent,
              startEventDi;

          // when
          expandedSubProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          startEvent = getChildStartEvents(expandedSubProcess)[0];
          startEventDi = getDi(startEvent);

          expect(startEventDi.$parent).to.exist;
        }
      ));

    });


    describe('task -> adhoc subprocess', function() {

      it('should NOT add start event child to adhoc subprocess', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var task = elementRegistry.get('Task_1'),
              collapsedSubProcess,
              startEvents;

          // when
          collapsedSubProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:AdHocSubProcess',
            isExpanded: true
          });

          // then
          startEvents = getChildStartEvents(collapsedSubProcess);

          expect(startEvents).to.have.length(0);
        }));
    });


    describe('task -> collapsed subprocess', function() {

      it('should NOT add start event child to subprocess', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var task = elementRegistry.get('Task_1'),
              collapsedSubProcess,
              startEvents;

          // when
          collapsedSubProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: false
          });

          // then
          startEvents = getChildStartEvents(collapsedSubProcess);

          expect(startEvents).to.have.length(0);
        }
      ));

    });


    describe('call activity -> expanded subprocess', function() {

      it('should add start event child to subprocess', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1'),
              expandedSubProcess,
              startEvents;

          // when
          expandedSubProcess = bpmnReplace.replaceElement(callActivity, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          startEvents = getChildStartEvents(expandedSubProcess);

          expect(startEvents).to.have.length(1);
        }
      ));


      it('should wire startEvent di correctly', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1'),
              expandedSubProcess,
              startEvent,
              startEventDi;

          // when
          expandedSubProcess = bpmnReplace.replaceElement(callActivity, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          startEvent = getChildStartEvents(expandedSubProcess)[0];
          startEventDi = getDi(startEvent);

          expect(startEventDi.$parent).to.exist;
        }
      ));

    });

  });

});

// helpers //////////

function isStartEvent(element) {
  return is(element, 'bpmn:StartEvent');
}

function getChildStartEvents(element) {
  return element.children.filter(isStartEvent);
}
