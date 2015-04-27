'use strict';

var TestHelper = require('../../../TestHelper');

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
      expect(targetShape).toBeDefined();
      expect(target.$instanceOf('bpmn:Task')).toBe(true);
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
      expect(target.di).toBeDefined();
      expect(target.di.$parent).toBe(startEvent.di.$parent);

      expect(target.di.bounds.x).toBe(targetShape.x);
      expect(target.di.bounds.y).toBe(targetShape.y);
      expect(target.di.bounds.width).toBe(targetShape.width);
      expect(target.di.bounds.height).toBe(targetShape.height);
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
      expect(subProcess.get('flowElements')).toContain(target);
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
        expect(label).toBeDefined();
        expect(elementRegistry.get(label.id)).toBeDefined();

        expect(label.x).toBe(441);
        expect(label.y).toBe(278);
        expect(label.width).toBe(LabelUtil.DEFAULT_LABEL_SIZE.width);
        expect(label.height).toBe(LabelUtil.DEFAULT_LABEL_SIZE.height);
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
        expect(target.di.label).toBeDefined();

        expect(target.di.label.bounds.x).toBe(targetShape.label.x);
        expect(target.di.label.bounds.y).toBe(targetShape.label.y);
        expect(target.di.label.bounds.width).toBe(targetShape.label.width);
        expect(target.di.label.bounds.height).toBe(targetShape.label.height);
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
      expect(connection).toBeDefined();
      expect(connection.$instanceOf('bpmn:SequenceFlow')).toBe(true);
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
      expect(subProcess.get('flowElements')).not.toContain(target);
      expect(subProcess.di.$parent.get('planeElement')).not.toContain(target.di);
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
      expect(connection.sourceRef).toBe(null);
      expect(connection.targetRef).toBe(null);
      expect(connection.$parent).toBe(null);
      expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);

      expect(targetShape.label).not.toBeDefined();
      expect(elementRegistry.get(target.id + '_label')).not.toBeDefined();
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
      expect(connection.sourceRef).toBe(null);
      expect(connection.targetRef).toBe(null);

      expect(startEvent.get('outgoing')).not.toContain(connection);
      expect(target.get('incoming')).not.toContain(connection);

      expect(connection.$parent).toBe(null);
      expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);

      expect(elementRegistry.get(targetShape.id)).not.toBeDefined();
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
      expect(connection.sourceRef).toBe(null);
      expect(connection.targetRef).toBe(null);
      expect(connection.$parent).toBe(null);
      expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);

      expect(elementRegistry.get(connection.id + '_label')).not.toBeDefined();
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
      expect(targetShape.parent).toBe(subProcessShape);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(targetShape2.parent).toBe(null);
      expect(elementRegistry.get(targetShape2.id)).not.toBeDefined();
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
      expect(connection.sourceRef).toBe(null);
      expect(connection.targetRef).toBe(null);
      expect(connection.$parent).toBe(null);

      expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);
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
        expect(targetShape).toBeDefined();
        expect(target.$instanceOf('bpmn:ExclusiveGateway')).toBe(true);
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
        expect(subProcess.get('flowElements')).toContain(target);
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
        expect(subProcess.get('flowElements')).not.toContain(target);
        expect(subProcess.di.$parent.get('planeElement')).not.toContain(target.di);
      }));

    });

  });

});
