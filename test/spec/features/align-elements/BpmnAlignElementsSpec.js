import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import alignElementsModule from 'diagram-js/lib/features/align-elements';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/align-elements', function() {

  var testModules = [ alignElementsModule, modelingModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/align-elements.bpmn');

  beforeEach(bootstrapModeler(basicXML, { modules: testModules }));

  describe('integration', function() {

    it('should align to the left', inject(function(elementRegistry, alignElements) {

      // given
      var taskBoundEvt = elementRegistry.get('Task_boundary_evt'),
          task = elementRegistry.get('Task_lane'),
          subProcess = elementRegistry.get('SubProcess_lane'),
          endEvent = elementRegistry.get('EndEvent_lane'),
          elements = [ taskBoundEvt, task, subProcess, endEvent ];

      // when
      alignElements.trigger(elements, 'left');

      // then
      expect(taskBoundEvt.x).to.equal(136);
      expect(task.x).to.equal(136);
      expect(subProcess.x).to.equal(136);
      expect(endEvent.x).to.equal(136);
    }));


    it('should align to the right', inject(function(elementRegistry, alignElements) {

      // given
      var taskHello = elementRegistry.get('Task_hello'),
          task = elementRegistry.get('Task_lane'),
          subProcess = elementRegistry.get('SubProcess_lane'),
          endEvent = elementRegistry.get('EndEvent_lane'),
          elements = [ taskHello, task, subProcess, endEvent ];

      // when
      alignElements.trigger(elements, 'right');

      // then
      expect(task.x).to.equal(720);
      expect(taskHello.x).to.equal(720);
      expect(subProcess.x).to.equal(470);
      expect(endEvent.x).to.equal(784);
    }));


    it('should align to the center', inject(function(elementRegistry, alignElements) {

      // given
      var task = elementRegistry.get('Task_lane'),
          taskHello = elementRegistry.get('Task_hello'),
          subProcess = elementRegistry.get('SubProcess_lane'),
          endEvent = elementRegistry.get('EndEvent_lane'),
          elements = [ task, taskHello, subProcess, endEvent ];

      // when
      alignElements.trigger(elements, 'center');

      // then
      expect(task.x).to.equal(428);
      expect(taskHello.x).to.equal(428);
      expect(subProcess.x).to.equal(303);
      expect(endEvent.x).to.equal(460);
    }));


    it('should align to the top', inject(function(elementRegistry, alignElements) {

      // given
      var task = elementRegistry.get('Task_lane'),
          subProcess = elementRegistry.get('SubProcess_lane'),
          endEvent = elementRegistry.get('EndEvent_lane'),
          elements = [ task, subProcess, endEvent ];

      // when
      alignElements.trigger(elements, 'top');

      // then
      expect(task.y).to.equal(375);
      expect(subProcess.y).to.equal(375);
      expect(endEvent.y).to.equal(375);
    }));


    it('should align to the bottom', inject(function(elementRegistry, alignElements) {

      // given
      var task = elementRegistry.get('Task_lane'),
          subProcess = elementRegistry.get('SubProcess_lane'),
          endEvent = elementRegistry.get('EndEvent_lane'),
          elements = [ task, subProcess, endEvent ];

      // when
      alignElements.trigger(elements, 'bottom');

      // then
      expect(task.y).to.equal(761);
      expect(subProcess.y).to.equal(641);
      expect(endEvent.y).to.equal(805);
    }));


    it('should align to the middle', inject(function(elementRegistry, alignElements) {

      // given
      var task = elementRegistry.get('Task_lane'),
          subProcess = elementRegistry.get('SubProcess_lane'),
          endEvent = elementRegistry.get('EndEvent_lane'),
          elements = [ task, subProcess, endEvent ];

      // when
      alignElements.trigger(elements, 'middle');

      // then
      expect(task.y).to.equal(568);
      expect(subProcess.y).to.equal(508);
      expect(endEvent.y).to.equal(590);
    }));

  });

});
