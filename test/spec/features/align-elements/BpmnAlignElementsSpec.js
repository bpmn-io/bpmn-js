import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import alignElementsModule from 'lib/features/align-elements';
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
      expect(taskBoundEvt.x).to.equal(276);
      expect(task.x).to.equal(276);
      expect(subProcess.x).to.equal(276);
      expect(endEvent.x).to.equal(276);
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
      expect(task.x).to.equal(860);
      expect(taskHello.x).to.equal(860);
      expect(subProcess.x).to.equal(610);
      expect(endEvent.x).to.equal(924);
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
      expect(task.x).to.equal(568);
      expect(taskHello.x).to.equal(568);
      expect(subProcess.x).to.equal(443);
      expect(endEvent.x).to.equal(600);
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
      expect(task.y).to.equal(445);
      expect(subProcess.y).to.equal(445);
      expect(endEvent.y).to.equal(445);
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
      expect(task.y).to.equal(831);
      expect(subProcess.y).to.equal(711);
      expect(endEvent.y).to.equal(875);
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
      expect(task.y).to.equal(638);
      expect(subProcess.y).to.equal(578);
      expect(endEvent.y).to.equal(660);
    }));

  });


  describe('rules', function() {

    it('should not align boundary event', inject(function(alignElements, elementRegistry) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          host = elementRegistry.get('Task_boundary_evt');
      var elements = [
        host,
        elementRegistry.get('Task_hello'),
        boundaryEvent
      ];
      var initialRelativePosition = {
        x: boundaryEvent.x - host.x,
        y: boundaryEvent.y - host.y
      };

      // when
      alignElements.trigger(elements, 'middle');

      // then
      expect(boundaryEvent.x).to.equal(initialRelativePosition.x + host.x);
      expect(boundaryEvent.y).to.equal(initialRelativePosition.y + host.y);
    }));


    it('should not align container children', inject(
      function(alignElements, elementRegistry) {

        // given
        var elements = elementRegistry.getAll('SubProcessChild').slice(1),
            child = elementRegistry.get('Task_hello');
        var initialRelativePosition = {
          x: child.x - child.parent.x,
          y: child.y - child.parent.y
        };

        // when
        alignElements.trigger(elements, 'middle');

        // then
        expect(child.x).to.equal(initialRelativePosition.x + child.parent.x);
        expect(child.y).to.equal(initialRelativePosition.y + child.parent.y);
      })
    );
  });

});
