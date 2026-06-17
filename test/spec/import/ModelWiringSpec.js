import { expect } from 'chai';
import {
  bootstrapViewer,
  inject
} from 'bpmn-js/test/TestHelper.js';

import {
  is,
  getDi
} from 'bpmn-js/lib/util/ModelUtil.js';

import processXML from 'bpmn-js/test/fixtures/bpmn/import/process.bpmn';
import boundaryEventXML from 'bpmn-js/test/fixtures/bpmn/import/boundaryEvent.bpmn';
import laneFlowNodesXML from 'bpmn-js/test/spec/import/lane-flowNodes.bpmn';
import laneMissingFlowNodeRefXML from 'bpmn-js/test/spec/import/lane-missing-flowNodeRef.bpmn';


describe('import - model wiring', function() {

  describe('basics', function() {

    beforeEach(bootstrapViewer(processXML));


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
      var subProcessDi = getDi(subProcessShape);

      // then
      expect(subProcessDi).to.exist;
      expect(subProcessDi.bpmnElement).to.eql(subProcess);
    }));


    it('should wire connection di', inject(function(elementRegistry) {

      // when
      var sequenceFlowElement = elementRegistry.get('SequenceFlow_1');

      var sequenceFlow = sequenceFlowElement.businessObject;
      var sequenceFlowDi = getDi(sequenceFlowElement);

      // then
      expect(sequenceFlowDi).to.exist;
      expect(sequenceFlowDi.bpmnElement).to.eql(sequenceFlow);
    }));


    it('should wire label di', inject(function(elementRegistry) {

      // when
      var eventShape = elementRegistry.get('StartEvent_2');
      var eventLabel = elementRegistry.get('StartEvent_2_label');

      // assume
      expect(eventShape).to.exist;
      expect(eventLabel).to.exist;

      // label relationship wired
      expect(eventShape.label).to.eql(eventLabel);
      expect(eventLabel.labelTarget).to.eql(eventShape);

      // moddle relationships wired
      expect(eventShape.di).to.exist;
      expect(eventShape.businessObject).to.exist;

      expect(eventShape.di).to.eql(eventLabel.di);
      expect(eventShape.businessObject).to.eql(eventLabel.businessObject);
    }));

  });


  describe('host attacher relationship', function() {

    beforeEach(bootstrapViewer(boundaryEventXML));


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

    beforeEach(bootstrapViewer(laneFlowNodesXML));


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

    beforeEach(bootstrapViewer(laneMissingFlowNodeRefXML));


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