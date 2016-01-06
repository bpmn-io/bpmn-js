'use strict';

/* global bootstrapModeler, inject */

var TestHelper = require('../../../TestHelper');

var globalEvent = require('../../../util/MockEvents.js').createEvent;

var coreModule = require('../../../../lib/core'),
    popupMenuModule = require('diagram-js/lib/features/popup-menu'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    replaceMenuProviderModule = require('../../../../lib/features/popup-menu'),
    customRulesModule = require('../../../util/custom-rules');

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

/**
 * Gets all menu entries from the current open popup menu
 *
 * @param  {PopupMenu} popupMenu
 *
 * @return {<Array>}           [description]
 */
function getEntries(popupMenu) {
  var element = popupMenu._current.element;

  return popupMenu._current.provider.getEntries(element);
}


describe('features/replace-menu', function() {

  var diagramXMLMarkers = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn'),
      diagramXMLReplace = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    popupMenuModule,
    replaceModule,
    replaceMenuProviderModule,
    customRulesModule
  ];

  var openPopup = function(element, offset) {
    offset = offset || 100;

    TestHelper.getBpmnJS().invoke(function(popupMenu){

      popupMenu.create('bpmn-replace', element);

      popupMenu.open({ x: element.x + offset, y: element.y + offset });

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
        expect(loopCharacteristics.isSequential).not.to.exist;
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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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

        popupMenu.trigger(globalEvent(parallelEntry, { x: 0, y: 0 }));

        // toggle ad hoc on
        openPopup(subProcess);

        var adHocEntry = queryEntry(popupMenu, 'toggle-adhoc');

        var adHocSubProcess = popupMenu.trigger(globalEvent(adHocEntry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // then
        expect(task.businessObject.loopCharacteristics).not.to.exist;
        expect(domClasses(parallelEntry).has('active')).to.be.false;
      }));


      it('should toggle parallel marker on', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-parallel-mi');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var sequentialEntry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // then
        expect(task.businessObject.loopCharacteristics).not.to.exist;
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should toggle sequential marker on', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-sequential-mi');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var loopEntry = queryEntry(popupMenu, 'toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).not.to.exist;
      }));


      it('should toggle loop marker on', inject(function(popupMenu, bpmnReplace, elementRegistry){

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-loop');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
      var sendTask = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(sendTask.businessObject.loopCharacteristics).to.exist;
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
      var callActivity = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(callActivity.businessObject.loopCharacteristics).to.exist;
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
      var transaction = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

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
      var subProcess = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(isExpanded(subProcess)).to.equal(isExpanded(transaction));
    }));


    it('should not retain the loop characteristics morphing to an event sub process',
      inject(function(popupMenu, bpmnReplace, elementRegistry, modeling) {

      // given
      var transaction = elementRegistry.get('Transaction');

      modeling.updateProperties(transaction, { loopCharacteristics: { isparallel: true } });

      openPopup(transaction);

      var entry = queryEntry(popupMenu, 'replace-with-event-subprocess');

      // when
      // replacing the transaction with an event sub process
      var subProcess = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(isExpanded(subProcess)).to.equal(isExpanded(transaction));
    }));


    it('should retain the expanded property morphing to an event sub processes',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var transaction = elementRegistry.get('Transaction');

      openPopup(transaction);

      var entry = queryEntry(popupMenu, 'replace-with-event-subprocess');

      // when
      // replacing the transaction with an expanded sub process
      var eventSubProcess = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(isExpanded(eventSubProcess)).to.equal(isExpanded(transaction));
    }));

  });


  describe('replace menu', function() {


    describe('events', function() {

      beforeEach(bootstrapModeler(diagramXMLReplace, { modules: testModules }));

      it('should contain all except the current one',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');

        // when
        openPopup(startEvent);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-none-start')).to.be.null;
        expect(entriesContainer.childNodes.length).to.equal(6);
      }));


      it('should contain all start events inside event sub process except the current one',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_3');

        // when
        openPopup(startEvent);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-non-interrupting-message-start')).to.be.null;
        expect(queryEntry(popupMenu, 'replace-with-message-start')).to.exist;
        expect(entriesContainer.childNodes.length).to.equal(11);
      }));


      it('should contain all non interrupting start events inside event sub process except the current one',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_3');

        var newElement = bpmnReplace.replaceElement(startEvent, {
          type: 'bpmn:StartEvent',
          eventDefinition: 'bpmn:ConditionalEventDefinition',
          isInterrupting: false
        });

        // when
        openPopup(newElement);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-conditional-start')).to.exist;
        expect(queryEntry(popupMenu, 'replace-with-non-interrupting-conditional-start')).to.be.null;
        expect(entriesContainer.childNodes.length).to.equal(11);
      }));


      it('should contain all intermediate events except the current one',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var intermediateEvent = elementRegistry.get('IntermediateThrowEvent_1');

        // when
        openPopup(intermediateEvent);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-none-intermediate-throw')).to.be.null;
        expect(entriesContainer.childNodes.length).to.equal(12);
      }));


      it('should contain all end events except the current one',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var endEvent = elementRegistry.get('EndEvent_1');

        // when
        openPopup(endEvent);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-none-end')).to.be.null;
        expect(entriesContainer.childNodes.length).to.equal(8);
      }));

    });


    describe('cancel events', function() {

      var diagramXML = require('../../../fixtures/bpmn/features/replace/cancel-events.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      it('should contain cancel event replace option',

        inject(function(elementRegistry, bpmnReplace, popupMenu, replaceMenuProvider) {
        // given
        var endEvent = elementRegistry.get('EndEvent_1');

        // when
        openPopup(endEvent);

        var entries = getEntries(popupMenu);

        // then
        expect(entries).to.have.length(9);
      }));


      it('should NOT contain cancel event replace option',

        inject(function(elementRegistry, bpmnReplace, popupMenu, replaceMenuProvider) {
        // given
        var endEvent = elementRegistry.get('EndEvent_2');



        // when
        openPopup(endEvent);

        var entries = getEntries(popupMenu);

        // then
        expect(entries).to.have.length(8);
      }));


      it('should contain cancel event replace option (boundary events)',
        inject(function(elementRegistry, bpmnReplace, popupMenu) {

        // given
        var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        openPopup(boundaryEvent);

        // when
        var entries = getEntries(popupMenu);

        // then
        expect(entries).to.have.length(12);

      }));


      it('should NOT contain cancel event replace option (boundary events)',
        inject(function(elementRegistry, bpmnReplace, popupMenu) {

        // given
        var boundaryEvent = elementRegistry.get('BoundaryEvent_2');

        // when
        openPopup(boundaryEvent, 40);

        var entries = getEntries(popupMenu);

        // then
        expect(entries).to.have.length(11);

      }));

    });


    describe('boundary events', function() {

      beforeEach(bootstrapModeler(diagramXMLReplace, { modules: testModules }));

      it('should contain all boundary events for an interrupting boundary event',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        // when
        openPopup(boundaryEvent, 40);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-conditional-intermediate-catch')).to.be.null;
        expect(entriesContainer.childNodes.length).to.equal(10);
      }));


      it('should contain all boundary events for a non interrupting boundary event',
        inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var boundaryEvent = elementRegistry.get('BoundaryEvent_2');

        // when
        openPopup(boundaryEvent, 40);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(queryEntry(popupMenu, 'replace-with-non-interrupting-message-intermediate-catch')).to.be.null;
        expect(entriesContainer.childNodes.length).to.equal(10);
      }));

    });


    describe('default flows', function() {

      var diagramXML = require('./BpmnReplace.defaultFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      it('should show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(entriesContainer.childNodes.length).to.equal(1);
      }));


      it('should NOT show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_4');

        // when
        openPopup(sequenceFlow);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(entriesContainer.childNodes.length).to.equal(0);
      }));

    });


    describe('default flows from inclusive gateways', function() {

      var diagramXML = require('./BpmnReplace.defaultFlowsFromInclusiveGateways.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      it('should show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry(popupMenu, 'replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry(popupMenu, 'replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).to.not.exist;
        expect(defaultFlowEntry).to.exist;
      }));


      it('should NOT show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry(popupMenu, 'replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry(popupMenu, 'replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).to.exist;
        expect(defaultFlowEntry).to.not.exist;
      }));

    });


    describe('conditional flows', function() {

      var diagramXML = require('./BpmnReplace.conditionalFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      it('should show ConditionalFlow replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body'),
            conditionalFlowEntry = queryEntry(popupMenu, 'replace-with-conditional-flow');

        // then
        expect(conditionalFlowEntry).to.exist;
        expect(entriesContainer.childNodes.length).to.equal(1);
      }));


      it('should NOT show ConditionalFlow replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        //when
        openPopup(sequenceFlow);

        var entriesContainer = queryPopup(popupMenu, '.djs-popup-body');

        // then
        expect(entriesContainer.childNodes.length).to.equal(0);
      }));

    });

  });


  describe('integration', function() {


    describe('default flows', function() {

      var diagramXML = require('./BpmnReplace.defaultFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should replace SequenceFlow with DefaultFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        //when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        entries[0].action();

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should replace SequenceFlow with DefaultFlow -> undo',
        inject(function(elementRegistry, popupMenu, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        entries[0].action();

        commandStack.undo();

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.not.exist;
      }));


      it('should only have one DefaultFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow3 = elementRegistry.get('SequenceFlow_3');

        var entries;

        // when
        // trigger morphing sequenceFlow3 to default flow
        openPopup(sequenceFlow3);

        entries = getEntries(popupMenu);

        entries[0].action();

        // trigger morphing sequenceFlow to default flow
        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        entries[0].action();

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should replace DefaultFlow with SequenceFlow when changing source',
        inject(function(elementRegistry, popupMenu, modeling) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            task = elementRegistry.get('Task_2');

        openPopup(sequenceFlow);

        var sequenceFlowEntries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        sequenceFlowEntries[0].action();

        // when
        modeling.reconnectStart(sequenceFlow, task, [
          { x: 686, y: 267, original: { x: 686, y: 307 } },
          { x: 686, y: 207, original: { x: 686, y: 187 } }
        ]);

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.not.exist;
      }));


      it('should replace DefaultFlow with SequenceFlow when changing source -> undo',
        inject(function(elementRegistry, popupMenu, modeling, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            task = elementRegistry.get('Task_2');

        openPopup(sequenceFlow);

        var sequenceFlowEntries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        sequenceFlowEntries[0].action();

        // when
        modeling.reconnectStart(sequenceFlow, task, [
          { x: 686, y: 267, original: { x: 686, y: 307 } },
          { x: 686, y: 207, original: { x: 686, y: 187 } }
        ]);

        commandStack.undo();

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).equal(sequenceFlow.businessObject);
      }));


      it('should replace DefaultFlow with SequenceFlow when changing target',
        inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            root = canvas.getRootElement();

        var intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent'});

        modeling.createShape(intermediateEvent, { x: 686, y: 50 }, root);

        openPopup(sequenceFlow);

        var sequenceFlowEntries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        sequenceFlowEntries[0].action();

        // when
        modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
          { x: 686, y: 267, original: { x: 686, y: 307 } },
          { x: 686, y: 50, original: { x: 686, y: 75 } }
        ]);

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.not.exist;
      }));


      it('should replace DefaultFlow with SequenceFlow when changing target -> undo',
        inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            root = canvas.getRootElement();

        var intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent'});

        modeling.createShape(intermediateEvent, { x: 686, y: 50 }, root);

        openPopup(sequenceFlow);

        var sequenceFlowEntries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        sequenceFlowEntries[0].action();

        // when
        modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
          { x: 686, y: 267, original: { x: 686, y: 307 } },
          { x: 686, y: 50, original: { x: 686, y: 75 } }
        ]);

        commandStack.undo();

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).equal(sequenceFlow.businessObject);
      }));


      it('should keep DefaultFlow when morphing Gateway', inject(function(elementRegistry, popupMenu, bpmnReplace) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        entries[0].action();

        var inclusiveGateway = bpmnReplace.replaceElement(exclusiveGateway, { type: 'bpmn:InclusiveGateway'});

        // then
        expect(inclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should keep DefaultFlow when morphing Gateway -> undo',
        inject(function(elementRegistry, bpmnReplace, popupMenu, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        entries[0].action();

        bpmnReplace.replaceElement(exclusiveGateway, { type: 'bpmn:InclusiveGateway'});

        commandStack.undo();

        // then
        expect(exclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));
    });


    describe('conditional flows', function() {

      var diagramXML = require('./BpmnReplace.conditionalFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should morph into a ConditionalFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        // then
        expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
      }));


      it('should morph into a ConditionalFlow -> undo', inject(function(elementRegistry, popupMenu, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        commandStack.undo();

        // then
        expect(sequenceFlow.businessObject.conditionExpression).to.not.exist;
      }));


      it('should morph back into a SequenceFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        var conditionalEntries = getEntries(popupMenu, sequenceFlow);

        // replace with SequenceFlow
        conditionalEntries[0].action();

        // then
        expect(sequenceFlow.businessObject.conditionExpression).to.not.exist;
      }));


      it('should replace ConditionalFlow with SequenceFlow when changing source',
        inject(function(elementRegistry, popupMenu, modeling) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            startEvent = elementRegistry.get('StartEvent_1');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        // when
        modeling.reconnectStart(sequenceFlow, startEvent, [
          { x: 196, y: 197, original: { x: 178, y: 197 } },
          { x: 497, y: 278, original: { x: 547, y: 278 } }
        ]);

        // then
        expect(sequenceFlow.businessObject.conditionExpression).to.not.exist;
      }));


      it('should replace ConditionalFlow with SequenceFlow when changing source -> undo',
        inject(function(elementRegistry, popupMenu, modeling, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            startEvent = elementRegistry.get('StartEvent_1');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        // when
        modeling.reconnectStart(sequenceFlow, startEvent, [
          { x: 196, y: 197, original: { x: 178, y: 197 } },
          { x: 497, y: 278, original: { x: 547, y: 278 } }
        ]);

        commandStack.undo();

        // then
        expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
      }));


      it('should replace ConditionalFlow with SequenceFlow when changing target',
        inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            root = canvas.getRootElement(),
            intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent'});

        modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        // when
        modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
          { x: 389, y: 197, original: { x: 389, y: 197 } },
          { x: 497, y: 197, original: { x: 497, y: 197 } }
        ]);

        // then
        expect(sequenceFlow.businessObject.conditionExpression).to.not.exist;
      }));


      it('should replace ConditionalFlow with SequenceFlow when changing target -> undo',
        inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling, commandStack) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            root = canvas.getRootElement(),
            intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent'});

        modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        entries[0].action();

        // when
        modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
          { x: 389, y: 197, original: { x: 389, y: 197 } },
          { x: 497, y: 197, original: { x: 497, y: 197 } }
        ]);

        commandStack.undo();

        // then
        expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
      }));

    });

  });


  describe('rules', function () {

    var diagramXML = require('../../../fixtures/bpmn/basic.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules.concat([ customRulesModule ]) }));

    it('should get entries by default', inject(function(elementRegistry, popupMenu) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');

      // when
      openPopup(startEvent);

      var entries = getEntries(popupMenu);

      // then
      expect(entries).to.have.length.above(0);
    }));


    it('should get entries when custom rule returns true',
      inject(function(elementRegistry, popupMenu, customRules) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');

      customRules.addRule('shape.replace', function () {
        return true;
      });

      //when
      openPopup(startEvent);

      var entries = getEntries(popupMenu);

      // then
      expect(entries).to.have.length.above(0);
    }));


    it('should get no entries when custom rule returns false',
      inject(function(elementRegistry, popupMenu, customRules) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');

      customRules.addRule('shape.replace', function () {
        return false;
      });

      // when
      openPopup(startEvent);

      var entries = getEntries(popupMenu);

      // then
      expect(entries).to.have.length(0);
    }));


    it('should provide element to custom rules', inject(function(elementRegistry, popupMenu, customRules) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');
      var actual;

      customRules.addRule('shape.replace', function (context) {
        actual = context.element;
      });

      // when
      openPopup(startEvent);

      // then
      expect(actual).to.equal(startEvent);
    }));


    it('should evaluate rule once', inject(function(elementRegistry, popupMenu, customRules) {

      // given
      var callCount = 0;
      var startEvent = elementRegistry.get('StartEvent_1');

      customRules.addRule('shape.replace', function () {
        callCount++;
      });

      // when
      openPopup(startEvent);

      // then
      expect(callCount).to.equal(1);
    }));
  });

});
