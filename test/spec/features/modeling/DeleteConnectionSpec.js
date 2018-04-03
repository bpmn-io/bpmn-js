import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - #removeConnection', function() {

  var diagramXML = require('../../../fixtures/bpmn/sequence-flows.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlowShape = elementRegistry.get('SequenceFlow_2'),
          sequenceFlow = sequenceFlowShape.businessObject;

      // when
      modeling.removeConnection(sequenceFlowShape);

      // then
      expect(sequenceFlow.$parent).to.be.null;
    }));
  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var sequenceFlowShape = elementRegistry.get('SequenceFlow_2'),
          sequenceFlow = sequenceFlowShape.businessObject,
          parent = sequenceFlow.$parent;

      // when
      modeling.removeConnection(sequenceFlowShape);
      commandStack.undo();

      // then
      expect(sequenceFlow.$parent).to.eql(parent);
    }));
  });


  describe('redo support', function() {

    it('redo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var sequenceFlowShape = elementRegistry.get('SequenceFlow_2'),
          sequenceFlow = sequenceFlowShape.businessObject;

      // when
      modeling.removeConnection(sequenceFlowShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlow.$parent).to.be.null;
    }));
  });

});
