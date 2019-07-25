import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import draggingModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';

import { is } from 'lib/util/ModelUtil';
import { createCanvasEvent as canvasEvent } from 'test/util/MockEvents';

describe('features/modeling/behavior - subprocess start event', function() {

  var diagramXML = require('./SubProcessBehavior.start-event.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      createModule,
      draggingModule,
      modelingModule,
      replaceModule
    ]
  }));


  describe('create', function() {

    it('should contain start event child', inject(
      function(canvas, elementFactory, create, dragging) {

        // given
        var rootElement = canvas.getRootElement(),
            subProcess = elementFactory.createShape({
              type: 'bpmn:SubProcess',
              isExpanded: true
            }),
            startEvents;

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), subProcess);

        dragging.hover({ element: rootElement });

        dragging.move(canvasEvent({ x: 600, y: 150 }));

        dragging.end();

        // then
        startEvents = getChildStartEvents(subProcess);

        expect(startEvents).to.have.length(1);
      }
    ));


    it('should NOT contain start event child if hint behavior=false', inject(
      function(canvas, elementFactory, create, dragging) {

        // given
        var rootElement = canvas.getRootElement(),
            subProcess = elementFactory.createShape({
              type: 'bpmn:SubProcess',
              isExpanded: true
            }),
            startEvents;

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), subProcess, {
          hints: {
            behavior: false
          }
        });

        dragging.hover({ element: rootElement });

        dragging.move(canvasEvent({ x: 600, y: 150 }));

        dragging.end();

        // then
        startEvents = getChildStartEvents(subProcess);

        expect(startEvents).to.have.length(0);
      }
    ));

  });


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

  });

});

// helpers //////////

function isStartEvent(element) {
  return is(element, 'bpmn:StartEvent');
}

function getChildStartEvents(element) {
  return element.children.filter(isStartEvent);
}
