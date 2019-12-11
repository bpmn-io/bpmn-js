import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

var testModules = [ modelingModule, coreModule ];


describe('features - bpmn-updater', function() {

  describe('connection di', function() {

    var diagramXML = require('./BpmnUpdater.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should update after deleting intermediate element', inject(
      function(modeling, elementRegistry) {

        // given
        // sequence flow with existing sourceElement and targetElement di information
        var task = elementRegistry.get('Task_1'),
            sequenceFlowDi = elementRegistry.get('SequenceFlow_1').businessObject.di,
            startEventDi = elementRegistry.get('StartEvent_1').businessObject.di,
            endEventDi = elementRegistry.get('EndEvent_1').businessObject.di;

        // when
        modeling.removeElements([ task ]);

        // then
        expect(sequenceFlowDi.sourceElement).to.equal(startEventDi);
        expect(sequenceFlowDi.targetElement).to.equal(endEventDi);
      }
    ));


    it('should update on drop on flow', inject(
      function(modeling, elementRegistry, elementFactory) {

        // given
        // sequence flow with existing sourceElement and targetElement di information
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            startEventDi = elementRegistry.get('StartEvent_2').businessObject.di;

        var intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        });

        var dropPosition = { x: 320, y: 260 };

        // when
        var event = modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

        // then
        expect(sequenceFlow.businessObject.di.sourceElement).to.equal(startEventDi);
        expect(sequenceFlow.businessObject.di.targetElement).to.equal(event.businessObject.di);
      }
    ));


    it('should not create new di refs', inject(
      function(modeling, elementRegistry, elementFactory) {

        // given
        // sequence flow without any sourceElement and targetElement di information
        var sequenceFlow = elementRegistry.get('SequenceFlow_4');

        var intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        });

        var dropPosition = { x: 320, y: 260 };

        // when
        modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

        // then
        expect(sequenceFlow.businessObject.di.sourceElement).not.to.exist;
        expect(sequenceFlow.businessObject.di.targetElement).not.to.exist;
      }
    ));

  });


  describe('connection cropping', function() {

    var diagramXML = require('./BpmnUpdater.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    afterEach(sinon.restore);


    it('should crop connection only once per reconnect', inject(
      function(modeling, elementRegistry, connectionDocking) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            target = elementRegistry.get('EndEvent_2'),
            cropSpy = sinon.spy(connectionDocking, 'getCroppedWaypoints');

        // when
        modeling.reconnectEnd(sequenceFlow, target, { x: 418, y: 260 });

        // then
        expect(cropSpy).to.have.been.calledOnce;
        expect(cropSpy).to.have.been.calledWith(sequenceFlow);
      }
    ));


    it('should not crop connection after pasting', inject(
      function(canvas, copyPaste, elementRegistry, connectionDocking) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_5'),
            target = elementRegistry.get('Task_2'),
            cropSpy = sinon.spy(connectionDocking, 'getCroppedWaypoints');

        copyPaste.copy([
          target,
          sequenceFlow
        ]);

        // when
        copyPaste.paste({
          element: canvas.getRootElement(),
          point: {
            x: 500,
            y: 500
          }
        });

        // then
        expect(cropSpy).not.to.have.been.calledOnce;
      }
    ));

  });


  describe('incomplete DI', function() {

    var diagramXML = require('./BpmnUpdater.incompleteDi.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should add missing label bpmndi:Bounds', inject(
      function(modeling, elementRegistry) {

        // given
        var event = elementRegistry.get('StartEvent'),
            label = event.label,
            di = event.businessObject.di;

        // when
        modeling.moveElements([ label ], { x: 20, y: 20 });

        var labelBounds = di.label.bounds;

        // then
        expect(labelBounds).to.exist;

        expect(labelBounds).to.include.keys(
          'x', 'y',
          'width', 'height'
        );
      }
    ));


    it('should add missing bpmndi:BPMNLabel', inject(
      function(modeling, elementRegistry) {

        // given
        var event = elementRegistry.get('StartEvent_2'),
            label = event.label,
            di = event.businessObject.di;

        // when
        modeling.moveElements([ label ], { x: 20, y: 20 });

        var diLabel = di.label;

        // then
        expect(diLabel).to.exist;

        expect(diLabel.bounds).to.exist;
      }
    ));

  });

});
