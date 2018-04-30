import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import { is } from 'lib/util/ModelUtil';


describe('import - model wiring', function() {


  describe('basics', function() {

    var xml = require('../../fixtures/bpmn/import/process.bpmn');

    beforeEach(bootstrapViewer(xml));


    it('should wire root element', inject(function(elementRegistry, canvas) {

      // when
      var processElement = elementRegistry.get('Process_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      // then
      expect(subProcessShape.parent).to.eql(processElement);
      expect(canvas.getRootElement()).to.eql(processElement);

      expect(is(processElement, 'bpmn:Process')).to.be.true;
    }));


    it('should wire parent child relationship', inject(function(elementRegistry) {

      // when
      var subProcessShape = elementRegistry.get('SubProcess_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // then
      expect(startEventShape.type).to.equal('bpmn:StartEvent');
      expect(startEventShape.parent).to.eql(subProcessShape);

      expect(subProcessShape.children.length).to.equal(4);
    }));


    it('should wire label relationship', inject(function(elementRegistry) {

      // when
      var startEventShape = elementRegistry.get('StartEvent_1');
      var label = startEventShape.label;

      // then
      expect(label).to.exist;
      expect(label.id).to.equal(startEventShape.id + '_label');

      expect(label.labelTarget).to.eql(startEventShape);
    }));


    it('should wire businessObject', inject(function(elementRegistry) {

      // when
      var subProcessShape = elementRegistry.get('SubProcess_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      var subProcess = subProcessShape.businessObject,
          startEvent = startEventShape.businessObject;

      // then
      expect(subProcess).to.exist;
      expect(is(subProcess, 'bpmn:SubProcess')).to.be.true;

      expect(startEvent).to.exist;
      expect(is(startEvent, 'bpmn:StartEvent')).to.be.true;
    }));


    it('should wire shape di', inject(function(elementRegistry) {

      // when
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var subProcess = subProcessShape.businessObject;
      var subProcessDi = subProcess.di;

      // then
      expect(subProcessDi).to.exist;
      expect(subProcessDi.bpmnElement).to.eql(subProcess);
    }));


    it('should wire connection di', inject(function(elementRegistry) {

      // when
      var sequenceFlowElement = elementRegistry.get('SequenceFlow_1');

      var sequenceFlow = sequenceFlowElement.businessObject;
      var sequenceFlowDi = sequenceFlow.di;

      // then
      expect(sequenceFlowDi).to.exist;
      expect(sequenceFlowDi.bpmnElement).to.eql(sequenceFlow);
    }));

  });


  describe('host attacher relationship', function() {

    var xml = require('../../fixtures/bpmn/import/boundaryEvent.bpmn');

    beforeEach(bootstrapViewer(xml));


    it('should wire boundary event', inject(function(elementRegistry) {

      // when
      var boundaryEventShape = elementRegistry.get('BoundaryEvent_1'),
          boundaryEvent = boundaryEventShape.businessObject;

      var taskShape = elementRegistry.get('Task_1'),
          task = taskShape.businessObject;

      // assume
      expect(boundaryEvent.attachedToRef).to.eql(task);

      // then
      expect(boundaryEventShape.host).to.eql(taskShape);

      expect(taskShape.attachers).to.exist;
      expect(taskShape.attachers).to.contain(boundaryEventShape);
    }));

  });


  describe('lanes + flow elements', function() {

    var xml = require('./lane-flowNodes.bpmn');

    beforeEach(bootstrapViewer(xml));


    it('should import flowElements as children of Participant', inject(function(elementRegistry) {

      // when
      var participantShape = elementRegistry.get('Participant_Lane'),
          taskShape = elementRegistry.get('Task'),
          sequenceFlowElement = elementRegistry.get('SequenceFlow');

      // then
      expect(taskShape.parent).to.eql(participantShape);
      expect(sequenceFlowElement.parent).to.eql(participantShape);
    }));


    it('should wire FlowElement#lanes', inject(function(elementRegistry) {

      // when
      var taskShape = elementRegistry.get('Task'),
          task = taskShape.businessObject,
          laneShape = elementRegistry.get('Lane'),
          lane = laneShape.businessObject;

      // then
      expect(task.get('lanes')).to.eql([ lane ]);
    }));

  });


  describe('lanes + flow elements / missing flowNodeRef', function() {

    var xml = require('./lane-missing-flowNodeRef.bpmn');

    beforeEach(bootstrapViewer(xml));


    it('should import flowElements as children of Participant', inject(function(elementRegistry) {

      // when
      var participantShape = elementRegistry.get('Participant_Lane'),
          taskShape = elementRegistry.get('Task');

      // then
      // task is part of participant, as no lane was assigned
      expect(taskShape.parent).to.eql(participantShape);
    }));

  });

});