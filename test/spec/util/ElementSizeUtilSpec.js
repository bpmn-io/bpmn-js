import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  DEFAULT_TASK_SIZE,
  getDefaultSize
} from 'lib/util/ElementSizeUtil';


describe('util/ElementSizeUtil', function() {

  var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  describe('#getDefaultSize', function() {

    it('should return size of task', inject(function(bpmnFactory) {

      // given
      var task = bpmnFactory.create('bpmn:Task');

      // when
      var size = getDefaultSize(task);

      // then
      expect(size).to.eql({ width: 100, height: 80 });
    }));


    it('should return size of task sub type', inject(function(bpmnFactory) {

      // given
      var userTask = bpmnFactory.create('bpmn:UserTask');

      // when
      var size = getDefaultSize(userTask);

      // then
      expect(size).to.eql({ width: 100, height: 80 });
    }));


    it('should return size of gateway', inject(function(bpmnFactory) {

      // given
      var gateway = bpmnFactory.create('bpmn:ExclusiveGateway');

      // when
      var size = getDefaultSize(gateway);

      // then
      expect(size).to.eql({ width: 50, height: 50 });
    }));


    it('should return size of event', inject(function(bpmnFactory) {

      // given
      var startEvent = bpmnFactory.create('bpmn:StartEvent');

      // when
      var size = getDefaultSize(startEvent);

      // then
      expect(size).to.eql({ width: 36, height: 36 });
    }));


    it('should return size of lane', inject(function(bpmnFactory) {

      // given
      var lane = bpmnFactory.create('bpmn:Lane');

      // when
      var size = getDefaultSize(lane);

      // then
      expect(size).to.eql({ width: 400, height: 100 });
    }));


    it('should return size of data object reference', inject(function(bpmnFactory) {

      // given
      var dataObjectReference = bpmnFactory.create('bpmn:DataObjectReference');

      // when
      var size = getDefaultSize(dataObjectReference);

      // then
      expect(size).to.eql({ width: 36, height: 50 });
    }));


    it('should return size of data store reference', inject(function(bpmnFactory) {

      // given
      var dataStoreReference = bpmnFactory.create('bpmn:DataStoreReference');

      // when
      var size = getDefaultSize(dataStoreReference);

      // then
      expect(size).to.eql({ width: 50, height: 50 });
    }));


    it('should return size of text annotation', inject(function(bpmnFactory) {

      // given
      var textAnnotation = bpmnFactory.create('bpmn:TextAnnotation');

      // when
      var size = getDefaultSize(textAnnotation);

      // then
      expect(size).to.eql({ width: 100, height: 40 });
    }));


    it('should return size of group', inject(function(bpmnFactory) {

      // given
      var group = bpmnFactory.create('bpmn:Group');

      // when
      var size = getDefaultSize(group);

      // then
      expect(size).to.eql({ width: 300, height: 300 });
    }));


    it('should return default size for unknown type', inject(function(bpmnFactory) {

      // given
      var callActivity = bpmnFactory.create('bpmn:CallActivity');

      // when
      var size = getDefaultSize(callActivity);

      // then
      expect(size).to.eql({ width: 100, height: 80 });
    }));


    describe('sub process', function() {

      it('should return size of expanded sub process', inject(function(bpmnFactory) {

        // given
        var subProcess = bpmnFactory.create('bpmn:SubProcess');

        // when
        var size = getDefaultSize(subProcess, { isExpanded: true });

        // then
        expect(size).to.eql({ width: 350, height: 200 });
      }));


      it('should return size of collapsed sub process', inject(function(bpmnFactory) {

        // given
        var subProcess = bpmnFactory.create('bpmn:SubProcess');

        // when
        var size = getDefaultSize(subProcess, { isExpanded: false });

        // then
        expect(size).to.eql({ width: 100, height: 80 });
      }));


      it('should fall back to DI of element', inject(function(elementFactory) {

        // given
        var subProcess = elementFactory.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: true
        });

        // when
        var size = getDefaultSize(subProcess);

        // then
        expect(size).to.eql({ width: 350, height: 200 });
      }));

    });


    describe('participant', function() {

      function createParticipant(bpmnFactory, isExpanded) {
        return bpmnFactory.create('bpmn:Participant', isExpanded ? {
          processRef: bpmnFactory.create('bpmn:Process')
        } : {});
      }


      it('should return size of expanded participant', inject(function(bpmnFactory) {

        // given
        var participant = createParticipant(bpmnFactory, true);

        // when
        var size = getDefaultSize(participant, { isHorizontal: true });

        // then
        expect(size).to.eql({ width: 600, height: 250 });
      }));


      it('should return size of expanded vertical participant', inject(function(bpmnFactory) {

        // given
        var participant = createParticipant(bpmnFactory, true);

        // when
        var size = getDefaultSize(participant, { isHorizontal: false });

        // then
        expect(size).to.eql({ width: 250, height: 600 });
      }));


      it('should return size of collapsed participant', inject(function(bpmnFactory) {

        // given
        var participant = createParticipant(bpmnFactory, false);

        // when
        var size = getDefaultSize(participant, { isHorizontal: true });

        // then
        expect(size).to.eql({ width: 400, height: 60 });
      }));


      it('should return size of collapsed vertical participant', inject(function(bpmnFactory) {

        // given
        var participant = createParticipant(bpmnFactory, false);

        // when
        var size = getDefaultSize(participant, { isHorizontal: false });

        // then
        expect(size).to.eql({ width: 60, height: 400 });
      }));


      it('should default to horizontal without <isHorizontal>', inject(function(bpmnFactory) {

        // given
        var participant = createParticipant(bpmnFactory, true);

        // when
        var size = getDefaultSize(participant, {});

        // then
        expect(size).to.eql({ width: 600, height: 250 });
      }));


      it('should default to horizontal without DI', inject(function(bpmnFactory) {

        // given
        var participant = createParticipant(bpmnFactory, true);

        // when
        var size = getDefaultSize(participant);

        // then
        expect(size).to.eql({ width: 600, height: 250 });
      }));

    });


    describe('immutability', function() {

      it('should return new object', inject(function(bpmnFactory) {

        // given
        var task = bpmnFactory.create('bpmn:Task');

        // when
        var size = getDefaultSize(task);

        // then
        expect(size).not.to.equal(DEFAULT_TASK_SIZE);
        expect(size).not.to.equal(getDefaultSize(task));
      }));


      it('should not leak mutations', inject(function(bpmnFactory) {

        // given
        var task = bpmnFactory.create('bpmn:Task'),
            size = getDefaultSize(task);

        // when
        size.width = 999;

        // then
        expect(getDefaultSize(task)).to.eql({ width: 100, height: 80 });
        expect(DEFAULT_TASK_SIZE).to.eql({ width: 100, height: 80 });
      }));

    });

  });

});
