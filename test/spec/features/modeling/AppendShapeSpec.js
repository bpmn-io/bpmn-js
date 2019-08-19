import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  find
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - append shape', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ coreModule, modelingModule ];
  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // then
      expect(targetShape).to.exist;
      expect(target.$instanceOf('bpmn:Task')).to.be.true;
    }));


    it('should create DI', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');

      var startEvent = startEventShape.businessObject;

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // then
      expect(target.di).to.exist;
      expect(target.di.$parent).to.eql(startEvent.di.$parent);

      expect(target.di).to.have.bounds(targetShape);
    }));


    it('should add to parent (sub process)', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var subProcess = subProcessShape.businessObject;

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // then
      expect(subProcess.get('flowElements')).to.include(target);
    }));


    it('should add connection', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      var connection = find(subProcess.get('flowElements'), function(e) {
        return e.sourceRef === startEvent && e.targetRef === target;
      });

      // then
      expect(connection).to.exist;
      expect(connection.$instanceOf('bpmn:SequenceFlow')).to.be.true;
    }));

  });


  describe('undo support', function() {

    it('should undo add to parent', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1'),
          subProcessShape = elementRegistry.get('SubProcess_1');

      var subProcess = subProcessShape.businessObject;

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // when
      commandStack.undo();

      // then
      expect(subProcess.get('flowElements')).not.to.include(target);
      expect(subProcess.di.$parent.get('planeElement')).not.to.include(target.di);
    }));


    it('should undo add shape label', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1'),
          subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:EndEvent' }),
          target = targetShape.businessObject;

      var connection = find(subProcess.get('flowElements'), function(e) {
        return e.sourceRef === startEvent && e.targetRef === target;
      });

      // when
      commandStack.undo();

      // then
      expect(connection.sourceRef).to.be.null;
      expect(connection.targetRef).to.be.null;
      expect(connection.$parent).to.be.null;
      expect(subProcess.di.$parent.get('planeElement')).not.to.include(connection.di);

      expect(targetShape.label).not.to.exist;
      expect(elementRegistry.get(target.id + '_label')).not.to.exist;
    }));


    it('should undo add connection', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      var connection = find(subProcess.get('flowElements'), function(e) {
        return e.sourceRef === startEvent && e.targetRef === target;
      });

      // when
      commandStack.undo();

      // then
      expect(connection.sourceRef).to.be.null;
      expect(connection.targetRef).to.be.null;

      expect(startEvent.get('outgoing')).not.to.include(connection);
      expect(target.get('incoming')).not.to.include(connection);

      expect(connection.$parent).to.be.null;
      expect(subProcess.di.$parent.get('planeElement')).not.to.include(connection.di);

      expect(elementRegistry.get(targetShape.id)).not.to.exist;
    }));


    it('should undo add connection label', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      var connection = find(subProcess.get('flowElements'), function(e) {
        return e.sourceRef === startEvent && e.targetRef === target;
      });

      // when
      commandStack.undo();

      // then
      expect(connection.sourceRef).to.be.null;
      expect(connection.targetRef).to.be.null;
      expect(connection.$parent).to.be.null;
      expect(subProcess.di.$parent.get('planeElement')).not.to.include(connection.di);

      expect(elementRegistry.get(connection.id + '_label')).not.to.exist;
    }));


    it('should redo appending multiple shapes', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' });

      var targetShape2 = modeling.appendShape(targetShape, { type: 'bpmn:UserTask' });

      // when
      commandStack.undo();
      commandStack.undo();
      commandStack.redo();
      commandStack.redo();

      // then
      // expect redo to work on original target object
      expect(targetShape.parent).to.eql(subProcessShape);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(targetShape2.parent).to.be.null;
      expect(elementRegistry.get(targetShape2.id)).not.to.exist;
    }));


    it('should redo add connection', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      var connection = find(subProcess.get('flowElements'), function(e) {
        return e.sourceRef === startEvent && e.targetRef === target;
      });

      // when
      commandStack.undo();
      commandStack.redo();
      commandStack.undo();

      // then
      expect(connection.sourceRef).to.be.null;
      expect(connection.targetRef).to.be.null;
      expect(connection.$parent).to.be.null;

      expect(subProcess.di.$parent.get('planeElement')).not.to.include(connection.di);
    }));

  });


  describe('bpmn element support', function() {

    describe('ExclusiveGateway', function() {

      it('should append', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:ExclusiveGateway' }),
            target = targetShape.businessObject;

        // then
        expect(targetShape).to.exist;
        expect(target.$instanceOf('bpmn:ExclusiveGateway')).to.be.true;
      }));


      it('should add to parent (sub process)', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');
        var subProcessShape = elementRegistry.get('SubProcess_1');

        var subProcess = subProcessShape.businessObject;

        // when
        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:ExclusiveGateway' }),
            target = targetShape.businessObject;

        // then
        expect(subProcess.get('flowElements')).to.include(target);
      }));


      it('should undo append', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');
        var subProcessShape = elementRegistry.get('SubProcess_1');

        var subProcess = subProcessShape.businessObject;

        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:ExclusiveGateway' }),
            target = targetShape.businessObject;

        // when
        commandStack.undo();

        // then
        expect(subProcess.get('flowElements')).not.to.include(target);
        expect(subProcess.di.$parent.get('planeElement')).not.to.include(target.di);
      }));

    });

  });

});
