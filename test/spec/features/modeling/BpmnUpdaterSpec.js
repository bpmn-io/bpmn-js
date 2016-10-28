'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features - bpmn-updater', function() {

  var diagramXML = require('./BpmnUpdater.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('connection di', function() {

    it('should update after deleting intermediate element', inject(function(modeling, elementRegistry) {

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
    }));


    it('should update on drop on flow', inject(function(modeling, elementRegistry, elementFactory) {

      // given
      // sequence flow with existing sourceElement and targetElement di information
      var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
          startEventDi = elementRegistry.get('StartEvent_2').businessObject.di;

      var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' }),
          dropPosition = { x: 320, y: 260 };

      // when
      var event = modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

      // then
      expect(sequenceFlow.businessObject.di.sourceElement).to.equal(startEventDi);
      expect(sequenceFlow.businessObject.di.targetElement).to.equal(event.businessObject.di);
    }));


    it('should not create new di refs', inject(function(modeling, elementRegistry, elementFactory) {

      // given
      // sequence flow without any sourceElement and targetElement di information
      var sequenceFlow = elementRegistry.get('SequenceFlow_4');

      var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' }),
          dropPosition = { x: 320, y: 260 };

      // when
      modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

      // then
      expect(sequenceFlow.businessObject.di.sourceElement).not.to.exist;
      expect(sequenceFlow.businessObject.di.targetElement).not.to.exist;
    }));

  });

});
