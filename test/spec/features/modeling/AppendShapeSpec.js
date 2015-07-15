'use strict';

/* global bootstrapModeler, inject */

var find = require('lodash/collection/find');

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


var LabelUtil = require('../../../../lib/util/LabelUtil');


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
      expect(targetShape).to.be.defined;
      expect(target.$instanceOf('bpmn:Task')).to.be.true;
    }));


    it('should create DI', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // then
      expect(target.di).to.be.defined;
      expect(target.di.$parent).to.eql(startEvent.di.$parent);

      expect(target.di.bounds.x).to.equal(targetShape.x);
      expect(target.di.bounds.y).to.equal(targetShape.y);
      expect(target.di.bounds.width).to.equal(targetShape.width);
      expect(target.di.bounds.height).to.equal(targetShape.height);
    }));


    it('should add to parent (sub process)', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // then
      expect(subProcess.get('flowElements')).to.include(target);
    }));


    describe('should add external label', function() {

      it('correctly wired and positioned', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');
        var subProcessShape = elementRegistry.get('SubProcess_1');

        var startEvent = startEventShape.businessObject,
            subProcess = subProcessShape.businessObject;

        // when
        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:EndEvent' }),
            target = targetShape.businessObject;

        var label = targetShape.label;

        // then
        expect(label).to.be.defined;
        expect(elementRegistry.get(label.id)).to.be.defined;

        expect(label.x).to.equal(441);
        expect(label.y).to.equal(278);
        expect(label.width).to.equal(LabelUtil.DEFAULT_LABEL_SIZE.width);
        expect(label.height).to.equal(LabelUtil.DEFAULT_LABEL_SIZE.height);
      }));


      it('with di', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');
        var subProcessShape = elementRegistry.get('SubProcess_1');

        var startEvent = startEventShape.businessObject,
            subProcess = subProcessShape.businessObject;

        // when
        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:EndEvent' }),
            target = targetShape.businessObject;

        // then
        expect(target.di.label).to.be.defined;

        expect(target.di.label.bounds.x).to.equal(targetShape.label.x);
        expect(target.di.label.bounds.y).to.equal(targetShape.label.y);
        expect(target.di.label.bounds.width).to.equal(targetShape.label.width);
        expect(target.di.label.bounds.height).to.equal(targetShape.label.height);
      }));

    });


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
      expect(connection).to.be.defined;
      expect(connection.$instanceOf('bpmn:SequenceFlow')).to.be.true;
    }));

  });


  describe('undo support', function() {

    it('should undo add to parent', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

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
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

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

      expect(targetShape.label).not.to.be.defined;
      expect(elementRegistry.get(target.id + '_label')).not.to.be.defined;
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

      expect(elementRegistry.get(targetShape.id)).not.to.be.defined;
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

      expect(elementRegistry.get(connection.id + '_label')).not.to.be.defined;
    }));


    it('should redo appending multiple shapes', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

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
      expect(elementRegistry.get(targetShape2.id)).not.to.be.defined;
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
        expect(targetShape).to.be.defined;
        expect(target.$instanceOf('bpmn:ExclusiveGateway')).to.be.true;
      }));


      it('should add to parent (sub process)', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');
        var subProcessShape = elementRegistry.get('SubProcess_1');

        var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

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

        var startEvent = startEventShape.businessObject,
          subProcess = subProcessShape.businessObject;

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
