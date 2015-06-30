'use strict';

/* global bootstrapModeler, inject */

var TestHelper = require('../../../TestHelper');

var Events = require('diagram-js/test/util/Events.js');

var coreModule = require('../../../../lib/core'),
    popupMenuModule = require('diagram-js/lib/features/popup-menu'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var is = require('../../../../lib/util/ModelUtil').is,
    isExpanded = require('../../../../lib/util/DiUtil').isExpanded;

function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

describe('features/popup-menu', function() {

  var diagramXML = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

  var testModules = [ coreModule, modelingModule, popupMenuModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  afterEach(inject(function(popupMenu) {
    popupMenu.close();
  }));

  describe('active attribute', function(){

    it('should be true for parallel marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('ParallelTask'),
          loopCharacteristics = task.businessObject.loopCharacteristics;

      // when
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      // then
      expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(loopCharacteristics.isSequential).not.toBe(undefined);
      expect(loopCharacteristics.isSequential).toBe(false);
      expect(popupMenu._getEntry('toggle-parallel-mi').active).toBe(true);
    }));


    it('should be true for sequential marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask'),
          loopCharacteristics = task.businessObject.loopCharacteristics;

      // when
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      // then
      expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(loopCharacteristics.isSequential).toBe(true);
      expect(popupMenu._getEntry('toggle-sequential-mi').active).toBe(true);
    }));


    it('should be true for loop marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('LoopTask'),
          loopCharacteristics = task.businessObject.loopCharacteristics;

      // when
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      // then
      expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(false);
      expect(loopCharacteristics.isSequential).toBe(undefined);
      expect(popupMenu._getEntry('toggle-loop').active).toBe(true);
    }));
  });


  describe('parallel toggle button', function(){

    it('should toggle parallel marker off', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('ParallelTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // then
      expect(task.businessObject.loopCharacteristics).toBe(undefined);
      expect(domClasses(parallelEntry).has('active')).toBe(false);
    }));


    it('should toggle parallel marker on', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('Task');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // then
      expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(task.businessObject.loopCharacteristics.isSequential).toBe(false);
      expect(domClasses(parallelEntry).has('active')).toBe(true);
    }));


    it('should set sequential button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // then
      expect(domClasses(sequentialEntry).has('active')).toBe(false);
    }));


    it('should set loop button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('LoopTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var loopEntry = queryEntry(popupMenu, 'toggle-loop');

      // then
      expect(domClasses(loopEntry).has('active')).toBe(false);
    }));
  });


  describe('sequential toggle button', function(){

    it('should toggle sequential marker off', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // then
      expect(task.businessObject.loopCharacteristics).toBe(undefined);
      expect(domClasses(sequentialEntry).has('active')).toBe(false);
    }));


    it('should toggle sequential marker on', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('Task');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));
      var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // then
      expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(task.businessObject.loopCharacteristics.isSequential).toBe(true);
      expect(domClasses(sequentialEntry).has('active')).toBe(true);
    }));


    it('should set loop button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('LoopTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var loopEntry = queryEntry(popupMenu, 'toggle-loop');

      // then
      expect(domClasses(loopEntry).has('active')).toBe(false);
    }));


    it('should set parallel button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('ParallelTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // then
      expect(domClasses(parallelEntry).has('active')).toBe(false);
    }));
  });


  describe('loop toggle button', function(){

    it('should toggle loop marker off', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('LoopTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-loop');
      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var loopEntry = queryEntry(popupMenu, 'toggle-loop');

      // then
      expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(undefined);
      expect(domClasses(loopEntry).has('active')).toBe(false);
    }));


    it('should toggle loop marker on', inject(function(popupMenu, bpmnReplace, elementRegistry){

      // given
      var task = elementRegistry.get('Task');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-loop');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var loopEntry = queryEntry(popupMenu, 'toggle-loop');

      // then
      expect(is(task.businessObject.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')).toBe(true);
      expect(domClasses(loopEntry).has('active')).toBe(true);
    }));


    it('should set sequential button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-loop');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

      // then
      expect(domClasses(sequentialEntry).has('active')).toBe(false);
    }));


    it('should set parallel button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('ParallelTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-loop');

      // when
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // then
      expect(domClasses(parallelEntry).has('active')).toBe(false);
    }));
  });


  describe('replacing', function() {

    it('should retain the loop characteristics', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'replace-with-send-task');

      // when
      // replacing the task with a send task
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      // get the send task from the registry
      var sendTask = elementRegistry.filter(function(element, gfx) { return element.type === 'bpmn:SendTask';})[0];

      expect(sendTask.businessObject.loopCharacteristics).toBeDefined();
      expect(is(sendTask.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(sendTask.businessObject.loopCharacteristics.isSequential).toBe(true);
    }));


    it('should retain the loop characteristics for call activites',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'replace-with-call-activity');

      // when
      // replacing the task with a call activity
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      // get the send task from the registry
      var callActivity = elementRegistry.filter(function(element, gfx) {
        return element.type === 'bpmn:CallActivity';
      })[0];

      expect(callActivity.businessObject.loopCharacteristics).toBeDefined();
      expect(is(callActivity.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(callActivity.businessObject.loopCharacteristics.isSequential).toBe(true);

    }));


    it('should retain expanded status for sub processes',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var subProcess = elementRegistry.get('SubProcess');

      bpmnReplace.openChooser({ x: subProcess.x + 100, y: subProcess.y + 100 }, subProcess);

      var entry = queryEntry(popupMenu, 'replace-with-transaction');

      // when
      // replacing the expanded sub process with a transaction
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      // get the morphed transacion from the registry
      var transaction = elementRegistry.filter(function(element, gfx) {
        return element.x === subProcess.x && element.y === subProcess.y;
      })[0];

      expect(isExpanded(transaction)).toBe(isExpanded(subProcess));

    }));


    it('should retain the loop characteristics and the expanded status for transactions',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var transaction = elementRegistry.get('Transaction');

      bpmnReplace.openChooser({ x: transaction.x + 100, y: transaction.y + 100 }, transaction);

      var entry = queryEntry(popupMenu, 'replace-with-subprocess');

      // when
      // replacing the expanded sub process with a transaction
      popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      // get the morphed transacion from the registry
      var subProcess = elementRegistry.filter(function(element, gfx) {
        return element.x === transaction.x && element.y === transaction.y;
      })[0];

      expect(isExpanded(subProcess)).toBe(isExpanded(transaction));

    }));

  });

});
