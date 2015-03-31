'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/move - drop', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/drop/drop.bpmn');
  var diagramXML2 = require('../../../fixtures/bpmn/features/drop/recursive-task.bpmn');

  var testModules = [ coreModule, modelingModule ];


  describe('elements', function() {

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should update parent', inject(function(elementRegistry, modeling) {

      // given
      var task_1 = elementRegistry.get('ID_Task_1'),
          parent = elementRegistry.get('ID_SubProcess_1');

      // when
      modeling.moveShape(task_1, { x: 0, y: 200 }, parent);

      // then
      expect(task_1.parent).toBe(parent);
      expect(task_1.businessObject.$parent).toBe(parent.businessObject);
    }));


    it('should update parents', inject(function(elementRegistry, modeling) {

      // given
      var task_1 = elementRegistry.get('ID_Task_1'),
          task_2 = elementRegistry.get('ID_Task_2'),
          parent = elementRegistry.get('ID_SubProcess_1');

      // when
      modeling.moveShapes([ task_1, task_2 ], { x: 0, y: 200 }, parent);

      // then
      expect(task_1.parent).toBe(parent);
      expect(task_1.businessObject.$parent).toBe(parent.businessObject);
      expect(task_2.parent).toBe(parent);
      expect(task_2.businessObject.$parent).toBe(parent.businessObject);
    }));

  });


  describe('connection handling', function() {

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should remove flow if target and source have different parents',
        inject(function(elementRegistry, modeling) {

      // given
      var task_1 = elementRegistry.get('ID_Task_1'),
          parent = elementRegistry.get('ID_SubProcess_1'),
          flow   = elementRegistry.get('ID_Sequenceflow_1');

      // when
      modeling.moveShapes([ task_1 ], { x: 0, y: 200 }, parent);

      // then
      expect(flow.parent).toBe(null);
      expect(flow.businessObject.$parent).toBe(null);
    }));


    it('should update flow parent if target and source have same parents', inject(function(elementRegistry, modeling) {

      // given
      var task_1 = elementRegistry.get('ID_Task_1'),
          task_2 = elementRegistry.get('ID_Task_2'),
          parent = elementRegistry.get('ID_SubProcess_1'),
          flow   = elementRegistry.get('ID_Sequenceflow_1');

      // when
      modeling.moveShapes([ task_1, task_2 ], { x: 0, y: 250 }, parent);

      // then
      expect(flow.parent).toBe(parent);
      expect(flow.businessObject.$parent).toBe(parent.businessObject);
    }));

  });


  describe('recursion', function() {

    beforeEach(bootstrapModeler(diagramXML2, { modules: testModules }));

    it('should update parent', inject(function(elementRegistry, modeling) {

      // given
      var task_1 = elementRegistry.get('ID_task_1'),
          parent = elementRegistry.get('ID_subprocess_1'),
          sequenceFlow = elementRegistry.get('ID_sequenceflow_1');

      // when
      modeling.moveShapes([ task_1 ], { x: 0, y: 200 }, parent);

      // then
      expect(task_1.parent).toBe(parent);
      expect(task_1.businessObject.$parent).toBe(parent.businessObject);

      expect(sequenceFlow.parent).toBe(parent);
      expect(sequenceFlow.businessObject.$parent).toBe(parent.businessObject);
    }));

  });

});
