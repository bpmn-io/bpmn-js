'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */

var _ = require('lodash');

var fs = require('fs');

var bpmnFactoryModule = require('../../../../../lib/features/bpmn-modeling'),
    bpmnDrawModule = require('../../../../../lib/draw');


describe('features - bpmn-modeling', function() {

  beforeEach(Matchers.add);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf-8');

  var testModules = [ bpmnFactoryModule, bpmnDrawModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('commands', function() {


    describe('shape.appendNode', function() {

      it('should execute', inject(function(elementRegistry, bpmnModeling) {

        // given
        var startEventShape = elementRegistry.getById('StartEvent_1');

        // when
        var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
            target = targetShape.businessObject;

        // then
        expect(targetShape).toBeDefined();
        expect(target.$instanceOf('bpmn:Task')).toBe(true);
      }));


      it('should create DI', inject(function(elementRegistry, bpmnModeling) {

        // given
        var startEventShape = elementRegistry.getById('StartEvent_1');
        var subProcessShape = elementRegistry.getById('SubProcess_1');

        var startEvent = startEventShape.businessObject,
            subProcess = subProcessShape.businessObject;

        // when
        var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
            target = targetShape.businessObject;

        // then
        expect(target.di).toBeDefined();
        expect(target.di.$parent).toBe(startEvent.di.$parent);
      }));


      it('should add to parent (sub process)', inject(function(elementRegistry, bpmnModeling) {

        // given
        var startEventShape = elementRegistry.getById('StartEvent_1');
        var subProcessShape = elementRegistry.getById('SubProcess_1');

        var startEvent = startEventShape.businessObject,
            subProcess = subProcessShape.businessObject;

        // when
        var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
            target = targetShape.businessObject;

        // then
        expect(subProcess.get('flowElements')).toContain(target);
      }));


      it('should add connection', inject(function(elementRegistry, bpmnModeling) {

        // given
        var startEventShape = elementRegistry.getById('StartEvent_1');
        var subProcessShape = elementRegistry.getById('SubProcess_1');

        var startEvent = startEventShape.businessObject,
            subProcess = subProcessShape.businessObject;

        // when
        var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
            target = targetShape.businessObject;

        var connection = _.find(subProcess.get('flowElements'), function(e) {
          return e.sourceRef === startEvent && e.targetRef === target;
        });

        // then
        expect(connection).toBeDefined();
        expect(connection.$instanceOf('bpmn:SequenceFlow')).toBe(true);
      }));


      describe('undo support', function() {

        it('should undo add to parent', inject(function(elementRegistry, bpmnModeling, commandStack) {

          // given
          var startEventShape = elementRegistry.getById('StartEvent_1');
          var subProcessShape = elementRegistry.getById('SubProcess_1');

          var startEvent = startEventShape.businessObject,
              subProcess = subProcessShape.businessObject;

          var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
              target = targetShape.businessObject;

          // when
          commandStack.undo();

          // then
          expect(subProcess.get('flowElements')).not.toContain(target);
          expect(subProcess.di.$parent.get('planeElement')).not.toContain(target.di);
        }));


        it('should undo add shape label', inject(function(elementRegistry, bpmnModeling, commandStack) {

          // given
          var startEventShape = elementRegistry.getById('StartEvent_1');
          var subProcessShape = elementRegistry.getById('SubProcess_1');

          var startEvent = startEventShape.businessObject,
              subProcess = subProcessShape.businessObject;

          var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:EndEvent'),
              target = targetShape.businessObject;

          var connection = _.find(subProcess.get('flowElements'), function(e) {
            return e.sourceRef === startEvent && e.targetRef === target;
          });

          // when
          commandStack.undo();

          // then
          expect(connection.sourceRef).toBe(null);
          expect(connection.targetRef).toBe(null);
          expect(connection.$parent).toBe(null);
          expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);

          expect(elementRegistry.getById(targetShape.label.id)).not.toBeDefined();
        }));


        it('should undo add connection', inject(function(elementRegistry, bpmnModeling, commandStack) {

          // given
          var startEventShape = elementRegistry.getById('StartEvent_1');
          var subProcessShape = elementRegistry.getById('SubProcess_1');

          var startEvent = startEventShape.businessObject,
              subProcess = subProcessShape.businessObject;

          var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
              target = targetShape.businessObject;

          var connection = _.find(subProcess.get('flowElements'), function(e) {
            return e.sourceRef === startEvent && e.targetRef === target;
          });

          // when
          commandStack.undo();

          // then
          expect(connection.sourceRef).toBe(null);
          expect(connection.targetRef).toBe(null);
          expect(connection.$parent).toBe(null);
          expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);

          expect(elementRegistry.getById(targetShape.id)).not.toBeDefined();
        }));


        it('should undo add connection label', inject(function(elementRegistry, bpmnModeling, commandStack) {

          // given
          var startEventShape = elementRegistry.getById('StartEvent_1');
          var subProcessShape = elementRegistry.getById('SubProcess_1');

          var startEvent = startEventShape.businessObject,
              subProcess = subProcessShape.businessObject;

          var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
              target = targetShape.businessObject;

          var connection = _.find(subProcess.get('flowElements'), function(e) {
            return e.sourceRef === startEvent && e.targetRef === target;
          });

          // when
          commandStack.undo();

          // then
          expect(connection.sourceRef).toBe(null);
          expect(connection.targetRef).toBe(null);
          expect(connection.$parent).toBe(null);
          expect(subProcess.di.$parent.get('planeElement')).not.toContain(connection.di);

          expect(elementRegistry.getById(connection.id + '_label')).not.toBeDefined();
        }));


        it('should undo/redo appending multiple shapes', inject(function(elementRegistry, bpmnModeling, commandStack) {

          // given
          var startEventShape = elementRegistry.getById('StartEvent_1');
          var subProcessShape = elementRegistry.getById('SubProcess_1');

          var startEvent = startEventShape.businessObject,
              subProcess = subProcessShape.businessObject;

          var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
              target = targetShape.businessObject;

          var targetShape2 = bpmnModeling.appendFlowNode(targetShape, null, 'bpmn:UserTask');

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
          expect(elementRegistry.getById(targetShape2.id)).not.toBeDefined();
        }));


        it('should undo/redo add connection', inject(function(elementRegistry, bpmnModeling, commandStack) {

          // given
          var startEventShape = elementRegistry.getById('StartEvent_1');
          var subProcessShape = elementRegistry.getById('SubProcess_1');

          var startEvent = startEventShape.businessObject,
              subProcess = subProcessShape.businessObject;

          var targetShape = bpmnModeling.appendFlowNode(startEventShape, null, 'bpmn:Task'),
              target = targetShape.businessObject;

          var connection = _.find(subProcess.get('flowElements'), function(e) {
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

    });

  });

});