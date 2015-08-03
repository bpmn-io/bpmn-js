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

  var diagramXMLMarkers = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn'),
      diagramXMLReplace = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

  var testModules = [ coreModule, modelingModule, popupMenuModule, replaceModule ];

  var openPopup = function(element, offset) {
    offset = offset || 100;

    TestHelper.getBpmnJS().invoke(function(bpmnReplace){
      bpmnReplace.openChooser({ x: element.x + offset, y: element.y + offset }, element);
    });
  };


  describe('toggle', function(){

    beforeEach(bootstrapModeler(diagramXMLMarkers, { modules: testModules }));

    describe('active attribute', function(){

      it('should be true for parallel marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // when
        openPopup(task);

        // then
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;

        expect(loopCharacteristics.isSequential).to.be.false;
        expect(loopCharacteristics.isSequential).to.exist;

        expect(popupMenu._getEntry('toggle-parallel-mi').active).to.be.true;
      }));


      it('should be true for sequential marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // when
        openPopup(task);

        // then
        expect(loopCharacteristics.isSequential).to.be.true;
        expect(popupMenu._getEntry('toggle-sequential-mi').active).to.be.true;
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
      }));


      it('should be true for loop marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // when
        openPopup(task);

        // then
        expect(loopCharacteristics.isSequential).to.be.undefined;
        expect(popupMenu._getEntry('toggle-loop').active).to.be.true;
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.false;
      }));


      it('should be true for ad hoc marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var AdHocSubProcess = elementRegistry.get('AdHocSubProcess');

        // when
        openPopup(AdHocSubProcess);

        // then
        expect(popupMenu._getEntry('toggle-adhoc').active).to.be.true;
      }));

    });

    describe('exclusive toggle buttons', function(){

      it('should not toggle non exclusive buttons off', inject(function(popupMenu, bpmnReplace, elementRegistry) {
        var subProcess = elementRegistry.get('AdHocSubProcess');

        openPopup(subProcess);

        var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(subProcess);

        // then
        var adHocEntry = queryEntry(popupMenu, 'toggle-adhoc');

        expect(domClasses(adHocEntry).has('active')).to.be.true;
      }));

    });

    describe('non exclusive toggle buttons', function(){

      it('should not toggle exclusive buttons off',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var subProcess = elementRegistry.get('SubProcess');

        // when

        // toggle parallel on
        openPopup(subProcess);

        var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

        popupMenu.trigger(Events.create(parallelEntry, { x: 0, y: 0 }));

        // toggle ad hoc on
        openPopup(subProcess);

        var adHocEntry = queryEntry(popupMenu, 'toggle-adhoc');

        var adHocSubProcess = popupMenu.trigger(Events.create(adHocEntry, { x: 0, y: 0 }));

        openPopup(adHocSubProcess);

        // then
        parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');
        adHocEntry = queryEntry(popupMenu, 'toggle-adhoc');

        expect(domClasses(parallelEntry).has('active')).to.be.true;
        expect(domClasses(adHocEntry).has('active')).to.be.true;
      }));

    });

    describe('parallel toggle button', function(){

      it('should toggle parallel marker off',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // then
        expect(task.businessObject.loopCharacteristics).to.be.undefined;
        expect(domClasses(parallelEntry).has('active')).to.be.false;
      }));


      it('should toggle parallel marker on', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // then
        expect(domClasses(parallelEntry).has('active')).to.be.true;
        expect(task.businessObject.loopCharacteristics.isSequential).to.be.false;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
      }));


      it('should set sequential button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // then
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should set loop button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var loopEntry = queryEntry(popupMenu, 'toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
      }));

    });

    describe('sequential toggle button', function(){

      it('should toggle sequential marker off', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // then
        expect(task.businessObject.loopCharacteristics).to.be.undefined;
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should toggle sequential marker on', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // then
        expect(domClasses(sequentialEntry).has('active')).to.be.true;
        expect(task.businessObject.loopCharacteristics.isSequential).to.be.true;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
      }));


      it('should set loop button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var loopEntry = queryEntry(popupMenu, 'toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
      }));


      it('should set parallel button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // then
        expect(domClasses(parallelEntry).has('active')).to.be.false;
      }));

    });

    describe('loop toggle button', function(){

      it('should toggle loop marker off', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-loop');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var loopEntry = queryEntry(popupMenu, 'toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.undefined;
      }));


      it('should toggle loop marker on', inject(function(popupMenu, bpmnReplace, elementRegistry){

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-loop');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var loopEntry = queryEntry(popupMenu, 'toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.true;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')).to.be.true;
      }));


      it('should set sequential button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-loop');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // then
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should set parallel button inactive', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-loop');

        // when
        popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

        openPopup(task);

        var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // then
        expect(domClasses(parallelEntry).has('active')).to.be.false;
      }));
    });

  });

  describe('replacing', function() {

    beforeEach(bootstrapModeler(diagramXMLMarkers, { modules: testModules }));

    it('should retain the loop characteristics', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      openPopup(task);

      var entry = queryEntry(popupMenu, 'replace-with-send-task');

      // when
      // replacing the task with a send task
      var sendTask = popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      expect(sendTask.businessObject.loopCharacteristics).to.be.defined;
      expect(sendTask.businessObject.loopCharacteristics.isSequential).to.be.true;
      expect(is(sendTask.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
    }));


    it('should retain the loop characteristics for call activites',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      openPopup(task);

      var entry = queryEntry(popupMenu, 'replace-with-call-activity');

      // when
      // replacing the task with a call activity
      var callActivity = popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      expect(callActivity.businessObject.loopCharacteristics).to.be.defined;
      expect(callActivity.businessObject.loopCharacteristics.isSequential).to.be.true;
      expect(is(callActivity.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
    }));


    it('should retain expanded status for sub processes',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var subProcess = elementRegistry.get('SubProcess');

      openPopup(subProcess);

      var entry = queryEntry(popupMenu, 'replace-with-transaction');

      // when
      // replacing the expanded sub process with a transaction
      var transaction = popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      expect(isExpanded(transaction)).to.equal(isExpanded(subProcess));
    }));


    it('should retain the loop characteristics and the expanded status for transactions',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var transaction = elementRegistry.get('Transaction');

      openPopup(transaction);

      var entry = queryEntry(popupMenu, 'replace-with-subprocess');

      // when
      // replacing the transaction with an expanded sub process 
      var subProcess = popupMenu.trigger(Events.create(entry, { x: 0, y: 0 }));

      // then
      expect(isExpanded(subProcess)).to.equal(isExpanded(transaction));
    }));

  });

  describe('replace menu', function() {

    beforeEach(bootstrapModeler(diagramXMLReplace, { modules: testModules }));

    it('should contain all start events except the current one',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');

      // when
      openPopup(startEvent);

      var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

      // then
      expect(entriesContainer.childNodes.length).to.equal(6);
      expect(queryEntry(popupMenu, 'replace-with-none-start')).to.be.null;
    }));


    it('should contain all intermediate events except the current one',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var intermediateEvent = elementRegistry.get('IntermediateThrowEvent_1');

      // when
      openPopup(intermediateEvent);

      var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

      // then
      expect(entriesContainer.childNodes.length).to.equal(12);
      expect(queryEntry(popupMenu, 'replace-with-none-intermediate-throw')).to.be.null;
    }));


    it('should contain all end events except the current one',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var endEvent = elementRegistry.get('EndEvent_1');

      // when
      openPopup(endEvent);

      var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

      // then
      expect(entriesContainer.childNodes.length).to.equal(9);
      expect(queryEntry(popupMenu, 'replace-with-none-end')).to.be.null;
    }));


    it('should contain all boundary events for an interrupting boundary event',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      // when
      openPopup(boundaryEvent, 40);

      var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

      // then
      expect(entriesContainer.childNodes.length).to.equal(10);
      expect(queryEntry(popupMenu, 'replace-with-message-intermediate-catch')).to.be.null;
    }));


    it('should contain all boundary events for a non interrupting boundary event',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_2');

      // when
      openPopup(boundaryEvent, 40);

      var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

      // then
      expect(entriesContainer.childNodes.length).to.equal(10);
      expect(queryEntry(popupMenu, 'replace-with-non-interrupting-message-intermediate-catch')).to.be.null;
    }));

  });

});
