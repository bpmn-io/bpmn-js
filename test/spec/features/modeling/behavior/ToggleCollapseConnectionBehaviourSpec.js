import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';


import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';

import diagramXML from './ToggleCollapseConnectionBehaviourSpec.bpmn';


describe('features/modeling - Toggle Collapse Connection Behavior', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
    ]
  }));


  describe('Subprocess', function() {

    it('should reconnect flows on collapse', inject(function(elementRegistry, modeling) {

      // given
      var subProcess = elementRegistry.get('Subprocess_1'),
          task = elementRegistry.get('Task_1'),
          commentConnection = elementRegistry.get('Association_1'),
          incommingDataConnection = elementRegistry.get('DataAssociation_1'),
          outgoingDataConnection = elementRegistry.get('DataAssociation_2'),
          incommingMessageFlow = elementRegistry.get('MessageFlow_1'),
          outgoingMessageFlow = elementRegistry.get('MessageFlow_2');

      // when
      modeling.toggleCollapse(subProcess);

      // then
      expect(commentConnection.source).to.equal(task);
      expect(incommingDataConnection.target).to.equal(subProcess);
      expect(outgoingDataConnection.source).to.equal(subProcess);
      expect(incommingMessageFlow.target).to.equal(subProcess);
      expect(outgoingMessageFlow.source).to.equal(subProcess);
    }));


    it('should undo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var subProcess = elementRegistry.get('Subprocess_1'),
          task = elementRegistry.get('Task_1'),
          commentConnection = elementRegistry.get('Association_1'),
          incommingDataConnection = elementRegistry.get('DataAssociation_1'),
          outgoingDataConnection = elementRegistry.get('DataAssociation_2'),
          incommingMessageFlow = elementRegistry.get('MessageFlow_1'),
          outgoingMessageFlow = elementRegistry.get('MessageFlow_2');

      modeling.toggleCollapse(subProcess);

      // when
      commandStack.undo();

      // then
      expect(commentConnection.source).to.equal(task);
      expect(incommingDataConnection.target).to.equal(task);
      expect(outgoingDataConnection.source).to.equal(task);
      expect(incommingMessageFlow.target).to.equal(task);
      expect(outgoingMessageFlow.source).to.equal(task);
    }));


    it('should redo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var subProcess = elementRegistry.get('Subprocess_1'),
          task = elementRegistry.get('Task_1'),
          commentConnection = elementRegistry.get('Association_1'),
          incommingDataConnection = elementRegistry.get('DataAssociation_1'),
          outgoingDataConnection = elementRegistry.get('DataAssociation_2'),
          incommingMessageFlow = elementRegistry.get('MessageFlow_1'),
          outgoingMessageFlow = elementRegistry.get('MessageFlow_2');

      modeling.toggleCollapse(subProcess);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(commentConnection.source).to.equal(task);
      expect(incommingDataConnection.target).to.equal(subProcess);
      expect(outgoingDataConnection.source).to.equal(subProcess);
      expect(incommingMessageFlow.target).to.equal(subProcess);
      expect(outgoingMessageFlow.source).to.equal(subProcess);
    }));

  });

});