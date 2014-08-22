'use strict';

/* global bootstrapModeler, inject */

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    drawModule = require('../../../../lib/draw');


describe('features/modeling - #removeShape', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/sequence-flows.bpmn', 'utf-8');

  var testModules = [ drawModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.getById('Task_1'),
          task = taskShape.businessObject;

      // when
      modeling.removeShape(taskShape);

      // then
      expect(task.$parent).toBeNull();
    }));
  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var taskShape = elementRegistry.getById('Task_1'),
          task = taskShape.businessObject,
          parent = task.$parent;

      // when
      modeling.removeShape(taskShape);
      commandStack.undo();

      // then
      expect(task.$parent).toBe(parent);
    }));
  });


  describe('redo support', function() {

    it('redo', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var taskShape = elementRegistry.getById('Task_1'),
          task = taskShape.businessObject,
          parent = task.$parent;

      // when
      modeling.removeShape(taskShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(task.$parent).toBeNull();
    }));
  });

});
