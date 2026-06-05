import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';

import sequenceFlowsXML from '../../../fixtures/bpmn/sequence-flows.bpmn';
import croppingXML from './DeleteShape.cropping.bpmn';


var testModules = [
  coreModule,
  modelingModule
];


describe('features/modeling - #removeShape', function() {

  beforeEach(bootstrapModeler(sequenceFlowsXML, { modules: testModules }));


  describe('shape handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          task = taskShape.businessObject;

      // when
      modeling.removeShape(taskShape);

      // then
      expect(task.$parent).to.be.null;
    }));
  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          task = taskShape.businessObject,
          parent = task.$parent;

      // when
      modeling.removeShape(taskShape);
      commandStack.undo();

      // then
      expect(task.$parent).to.eql(parent);
    }));
  });


  describe('redo support', function() {

    it('redo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          task = taskShape.businessObject;

      // when
      modeling.removeShape(taskShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(task.$parent).to.be.null;
    }));
  });

});


describe('features/modeling - #removeShape - cropping', function() {

  beforeEach(bootstrapModeler(croppingXML, { modules: testModules }));


  it('should crop waypoints on undo/redo', inject(
    function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          incomingFlow = taskShape.incoming[0],
          outgoingFlow = taskShape.outgoing[0],
          expectedStart = incomingFlow.waypoints[0],
          expectedEnd = outgoingFlow.waypoints[1];

      // when
      modeling.removeShape(taskShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlowConnection).to.have.waypoints([ expectedStart, expectedEnd ]);
    }
  ));

});