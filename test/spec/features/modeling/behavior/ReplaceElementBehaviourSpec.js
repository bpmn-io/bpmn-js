'use strict';

require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var replacePreviewModule = require('../../../../../lib/features/replace-preview'),
    modelingModule = require('../../../../../lib/features/modeling'),
    moveModule = require('diagram-js/lib/features/move'),
    coreModule = require('../../../../../lib/core');

var is = require('../../../../../lib/util/ModelUtil').is,
    canvasEvent = require('../../../../util/MockEvents').createCanvasEvent;

var domQuery = require('min-dom/lib/query');


describe('features/modeling - move start event behavior', function() {

  var testModules = [
    replacePreviewModule,
    modelingModule,
    coreModule,
    moveModule
  ];


  describe('Start Events', function() {

    var diagramXML = require('../../../../fixtures/bpmn/event-sub-processes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var moveShape;

    beforeEach(inject(function(move, dragging, elementRegistry) {

      moveShape = function(shape, target, position) {
        var startPosition = { x: shape.x + 10 + shape.width / 2, y: shape.y + 30 + shape.height/2 };

        move.start(canvasEvent(startPosition), shape);

        dragging.hover({
          element: target,
          gfx: elementRegistry.getGraphics(target)
        });

        dragging.move(canvasEvent(position));
      };
    }));


    it('should select the replacement after replacing the start event',
      inject(function(elementRegistry, canvas, dragging, move, selection) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            rootElement = canvas.getRootElement();

        // when
        moveShape(startEvent, rootElement, { x: 140, y: 250 });

        dragging.end();

        var replacement = elementRegistry.get('StartEvent_1');

        // then
        expect(selection.get()).to.include(replacement);
        expect(selection.get()).not.to.include(startEvent);
      })
    );


    it('should select all moved shapes after some of them got replaced',
      inject(function(elementRegistry, canvas, dragging, move, selection) {

        // given
        var startEvent1 = elementRegistry.get('StartEvent_1'),
            startEvent2 = elementRegistry.get('StartEvent_2'),
            startEvent3 = elementRegistry.get('StartEvent_3'),
            rootElement = canvas.getRootElement();

        // when
        selection.select([ startEvent1, startEvent2, startEvent3 ]);
        moveShape(startEvent1, rootElement, { x: 140, y: 250 });

        dragging.end();

        var replacements = elementRegistry.filter(function(element) {
          if (is(element, 'bpmn:StartEvent') && element.type !== 'label') {
            return true;
          }
        });

        // then
        expect(selection.get()).to.include(replacements[0]);
        expect(selection.get()).to.include(replacements[1]);
        expect(selection.get()).to.include(replacements[2]);

      })
    );

  });


  describe('Cancel Events', function() {

    var diagramXML = require('../../../../fixtures/bpmn/features/replace/cancel-events.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('normal', function() {


      it('should unclaim ID and claim same ID with new element',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var transaction = elementRegistry.get('Transaction_1');

          var ids = transaction.businessObject.$model.ids;

          // when
          var subProcess = bpmnReplace.replaceElement(transaction, { type: 'bpmn:SubProcess' });

          // then
          expect(ids.assigned(transaction.id)).to.eql(subProcess.businessObject);
          expect(ids.assigned(subProcess.id)).to.eql(subProcess.businessObject);
          expect(subProcess.id).to.eql(transaction.id);
        })
      );


      it('should REVERT unclaim ID and claim same ID with new element on UNDO',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var transaction = elementRegistry.get('Transaction_1');

          var ids = transaction.businessObject.$model.ids;

          var subProcess = bpmnReplace.replaceElement(transaction, { type: 'bpmn:SubProcess' });

          // when
          commandStack.undo();

          // then
          expect(ids.assigned(transaction.id)).to.eql(transaction.businessObject);
          expect(subProcess.id).not.to.equal(transaction.id);
        })
      );


      it('should replace CancelEvent when morphing transaction',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var transaction = elementRegistry.get('Transaction_1'),
              endEvent = elementRegistry.get('EndEvent_1');

          // when
          bpmnReplace.replaceElement(endEvent, {
            type: 'bpmn:EndEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          var subProcess = bpmnReplace.replaceElement(transaction, { type: 'bpmn:SubProcess' });

          var newEndEvent = subProcess.children[0].businessObject;

          // then
          expect(subProcess.children).to.have.length(2);
          expect(newEndEvent.eventDefinitionTypes).to.not.exist;
        })
      );


      it('should replace CancelEvent when morphing transaction -> undo',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var transaction = elementRegistry.get('Transaction_1'),
              endEvent = elementRegistry.get('EndEvent_1');

          // when
          bpmnReplace.replaceElement(endEvent, {
            type: 'bpmn:EndEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          bpmnReplace.replaceElement(transaction, { type: 'bpmn:SubProcess' });

          commandStack.undo();

          var endEventAfter = elementRegistry.filter(function(element) {
            return (element.id !== 'EndEvent_2' && element.type === 'bpmn:EndEvent');
          })[0];

          // then
          expect(transaction.children).to.have.length(2);
          expect(endEventAfter.businessObject.eventDefinitions).to.exist;
        })
      );


      it('should replace a CancelEvent when moving outside of a transaction',
        inject(function(elementRegistry, bpmnReplace, modeling) {

          // given
          var process = elementRegistry.get('Process_1'),
              transaction = elementRegistry.get('Transaction_1'),
              endEvent = elementRegistry.get('EndEvent_1');

          // when
          var cancelEvent = bpmnReplace.replaceElement(endEvent, {
            type: 'bpmn:EndEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          modeling.moveElements([ cancelEvent ], { x: 0, y: 150 }, process);

          var endEventAfter = elementRegistry.filter(function(element) {
            return (element.parent === process && element.type === 'bpmn:EndEvent');
          })[0];

          // then
          expect(transaction.children).to.have.length(0);
          expect(endEventAfter.businessObject.eventDefinitions).to.not.exist;
        })
      );


      it('should replace a CancelEvent when moving outside of a transaction -> undo',
        inject(function(elementRegistry, bpmnReplace, modeling, commandStack) {

          // given
          var process = elementRegistry.get('Process_1'),
              transaction = elementRegistry.get('Transaction_1'),
              endEvent = elementRegistry.get('EndEvent_1');

          // when
          var cancelEvent = bpmnReplace.replaceElement(endEvent, {
            type: 'bpmn:EndEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          modeling.moveElements([ cancelEvent ], { x: 0, y: 150 }, process);

          commandStack.undo();

          var endEventAfter = elementRegistry.filter(function(element) {
            return (element.id !== 'EndEvent_2' && element.type === 'bpmn:EndEvent');
          })[0];

          // then
          expect(transaction.children).to.have.length(2);
          expect(endEventAfter.businessObject.eventDefinitions).to.exist;
        })
      );

    });


    describe('boundary events', function() {

      it('should replace CancelBoundaryEvent when morphing from a transaction',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              transaction = elementRegistry.get('Transaction_1');

          // when
          bpmnReplace.replaceElement(boundaryEvent, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          var subProcess = bpmnReplace.replaceElement(transaction, { type: 'bpmn:SubProcess' });

          var newBoundaryEvent = subProcess.attachers[0].businessObject;

          // then
          expect(newBoundaryEvent.eventDefinitionTypes).to.not.exist;
          expect(newBoundaryEvent.attachedToRef).to.equal(subProcess.businessObject);
          expect(elementRegistry.get('Transaction_1')).to.eql(subProcess);
        })
      );


      it('should replace CancelBoundaryEvent when morphing from a transaction -> undo',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              transaction = elementRegistry.get('Transaction_1');

          // when
          bpmnReplace.replaceElement(boundaryEvent, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          bpmnReplace.replaceElement(transaction, { type: 'bpmn:SubProcess' });

          commandStack.undo();

          var afterBoundaryEvent = elementRegistry.filter(function(element) {
            return (element.type === 'bpmn:BoundaryEvent' && element.id !== 'BoundaryEvent_2');
          })[0];

          // then
          expect(afterBoundaryEvent.businessObject.eventDefinitions).exist;
          expect(afterBoundaryEvent.businessObject.attachedToRef).to.equal(transaction.businessObject);
          expect(transaction.attachers).to.have.length(1);
        })
      );


      it('should replace CancelBoundaryEvent when attaching to a NON-transaction',
        inject(function(elementRegistry, bpmnReplace, modeling) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              subProcess = elementRegistry.get('SubProcess_1'),
              process = elementRegistry.get('Process_1'),
              transaction = elementRegistry.get('Transaction_1');

          // when
          var newBoundaryEvent = bpmnReplace.replaceElement(boundaryEvent, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          modeling.moveElements([ newBoundaryEvent ], { x: 500, y: 0 }, subProcess, true);

          var movedBoundaryEvent = elementRegistry.filter(function(element) {
            return (element.type === 'bpmn:BoundaryEvent' && element.id !== 'BoundaryEvent_2');
          })[0];

          // then
          expect(movedBoundaryEvent.businessObject.eventDefinitions).to.not.exist;
          expect(movedBoundaryEvent.businessObject.attachedToRef).to.equal(subProcess.businessObject);
          expect(movedBoundaryEvent.parent).to.equal(process);

          expect(movedBoundaryEvent.host).to.equal(subProcess);
          expect(subProcess.attachers).to.contain(movedBoundaryEvent);
          expect(transaction.attachers).to.be.empty;
        })
      );


      it('should replace CancelBoundaryEvent when attaching to a NON-transaction -> undo',
        inject(function(elementRegistry, bpmnReplace, modeling, commandStack) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              transaction = elementRegistry.get('Transaction_1'),
              subProcess = elementRegistry.get('SubProcess_1');

          // when
          var newBoundaryEvent = bpmnReplace.replaceElement(boundaryEvent, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          modeling.moveElements([ newBoundaryEvent ], { x: 500, y: 0 }, subProcess, true);

          commandStack.undo();

          var movedBoundaryEvent = elementRegistry.filter(function(element) {
            return (element.type === 'bpmn:BoundaryEvent' && element.id !== 'BoundaryEvent_2');
          })[0];

          // then
          expect(movedBoundaryEvent.businessObject.eventDefinitions).to.exist;
          expect(movedBoundaryEvent.businessObject.attachedToRef).to.equal(transaction.businessObject);

          expect(movedBoundaryEvent.host).to.equal(transaction);
          expect(transaction.attachers).to.contain(movedBoundaryEvent);
          expect(subProcess.attachers).to.have.length(1);
        })
      );


      it('should NOT allow morphing into an IntermediateEvent',
        inject(function(elementRegistry, bpmnReplace, commandStack, move, dragging) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              subProcess = elementRegistry.get('SubProcess_1');

          // when
          var newBoundaryEvent = bpmnReplace.replaceElement(boundaryEvent, {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:CancelEventDefinition'
          });

          move.start(canvasEvent({ x: 0, y: 0 }), newBoundaryEvent);

          dragging.hover({
            gfx: elementRegistry.getGraphics(subProcess),
            element: subProcess
          });
          dragging.move(canvasEvent({ x: 450, y: -50 }));

          var canExecute = dragging.context().data.context.canExecute;

          // then
          expect(canExecute).to.be.false;
        })
      );

    });

  });


  describe('outline', function() {

    var diagramXML = require('../../../../fixtures/bpmn/features/replace/connection.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should update size of outline on replace', inject(function(bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('Task_2');

      // when
      var subProcess = bpmnReplace.replaceElement(task, {
        type: 'bpmn:SubProcess',
        isExpanded: true
      });

      // then
      var gfx = elementRegistry.getGraphics(subProcess);
      var outline = domQuery('.djs-outline', gfx);

      expect(outline.getBBox().width).to.equal(gfx.getBBox().width);
      expect(outline.getBBox().height).to.equal(gfx.getBBox().height);
    }));

  });

});
