import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getDi } from 'lib/util/ModelUtil';

import { pick } from 'min-dash';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

var testModules = [ coreModule, modelingModule ];


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
            sequenceFlowDi = getDi(elementRegistry.get('SequenceFlow_1')),
            startEventDi = getDi(elementRegistry.get('StartEvent_1')),
            endEventDi = getDi(elementRegistry.get('EndEvent_1'));

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
            startEventDi = getDi(elementRegistry.get('StartEvent_2')),
            sequenceFlowDi = getDi(sequenceFlow);

        var intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        });

        var dropPosition = { x: 320, y: 260 };

        // when
        var event = modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

        // then
        expect(sequenceFlowDi.sourceElement).to.equal(startEventDi);
        expect(sequenceFlowDi.targetElement).to.equal(getDi(event));
      }
    ));


    it('should not create new di refs', inject(
      function(modeling, elementRegistry, elementFactory) {

        // given
        // sequence flow without any sourceElement and targetElement di information
        var sequenceFlow = elementRegistry.get('SequenceFlow_4'),
            sequenceFlowDi = getDi(sequenceFlow);

        var intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        });

        var dropPosition = { x: 320, y: 260 };

        // when
        modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

        // then
        expect(sequenceFlowDi.sourceElement).not.to.exist;
        expect(sequenceFlowDi.targetElement).not.to.exist;
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
            di = getDi(event);

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
            di = getDi(event);

        // when
        modeling.moveElements([ label ], { x: 20, y: 20 });

        var diLabel = di.label;

        // then
        expect(diLabel).to.exist;

        expect(diLabel.bounds).to.exist;
      }
    ));

  });


  describe('update embedded label bounds', function() {

    var diagramXML = require('./BpmnUpdater.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var bounds,
        di;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_3');

      di = getDi(task);

      bounds = pick(di.get('label').get('bounds'), [ 'x', 'y', 'width', 'height' ]);

      // when
      modeling.moveShape(task, {
        x: 100,
        y: 100
      });
    }));


    it('<do>', function() {

      // then
      expect(di.get('label').get('bounds')).to.include({
        x: bounds.x + 100,
        y: bounds.y + 100,
        width: bounds.width,
        height: bounds.height
      });
    });


    it('<undo>', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      expect(di.get('label').get('bounds')).to.include({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      });
    }));


    it('<redo>', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(di.get('label').get('bounds')).to.include({
        x: bounds.x + 100,
        y: bounds.y + 100,
        width: bounds.width,
        height: bounds.height
      });
    }));

  });


  describe('BPMNLabel', function() {

    describe('embedded', function() {

      it('should set BPMNLabel on task', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        // when
        modeling.updateLabel(task, 'foo');

        // then
        expect(task.businessObject.name).to.equal('foo');
        expect(getDi(task).label).to.exist;
      }));


      it('should unset BPMNLabel on task', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_3');

        // when
        modeling.updateLabel(task, '');

        // then
        expect(task.businessObject.name).to.equal('');
        expect(getDi(task)).not.to.have.property('label');
      }));
    });


  });

});
